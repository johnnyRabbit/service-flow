import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroqService } from '../ai/groq.service';
import { AuditService } from '../audit/audit.service';

export interface WebChatMessage {
  visitorId: string;
  visitorName?: string;
  visitorEmail?: string;
  chatId: string;
  message: string;
  timestamp: string;
  platform: 'tawk' | 'crisp' | 'tidio' | 'custom';
}

@Injectable()
export class WebChatService {
  private readonly logger = new Logger(WebChatService.name);

  constructor(
    private prisma: PrismaService,
    private groqService: GroqService,
    private auditService: AuditService,
  ) {}

  /**
   * Process incoming web chat message
   */
  async processMessage(message: WebChatMessage) {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Processing web chat message from ${message.visitorId}`);

      // 1. Find or create customer
      const customer = await this.findOrCreateCustomer(message);

      // 2. Find or create conversation
      const conversation = await this.findOrCreateConversation(customer.id, message.platform);

      // 3. Save incoming message
      await this.saveMessage(conversation.id, 'CUSTOMER', message.visitorName || 'Visitante', message.message);

      // 4. Build conversation context for AI
      const context = await this.buildConversationContext(conversation, customer);

      // 5. Process with AI
      const aiResponse = await this.groqService.processMessage(message.message, context);

      // 6. Handle AI response
      await this.handleAIResponse(conversation, customer, aiResponse);

      // 7. Save AI response as message
      await this.saveMessage(conversation.id, 'AI', 'Assistente IA', aiResponse.suggestedReply);

      // 8. Update conversation state
      await this.updateConversationState(conversation.id, aiResponse);

      // 9. Log to audit
      await this.auditService.log({
        organizationId: conversation.organizationId,
        actorType: 'AI',
        actorId: 'ai_engine',
        actorName: 'Assistente IA',
        action: 'PROCESSED_WEBCHAT_MESSAGE',
        entityType: 'CONVERSATION',
        entityId: conversation.id,
        after: {
          intent: aiResponse.intent,
          confidence: aiResponse.confidence,
          processingTime: Date.now() - startTime,
          platform: message.platform,
        },
      });

      this.logger.log(`Web chat message processed in ${Date.now() - startTime}ms`);

      // 10. Return AI response
      return {
        reply: aiResponse.suggestedReply,
        intent: aiResponse.intent,
        requiresHuman: aiResponse.requiresHuman,
      };
    } catch (error) {
      this.logger.error('Error processing web chat message:', error);
      
      // Return fallback response
      return {
        reply: 'Desculpe, estou com dificuldades técnicas. Um dos nossos técnicos irá contactá-lo em breve.',
        intent: 'UNKNOWN',
        requiresHuman: true,
      };
    }
  }

  /**
   * Find existing customer or create new one based on visitor info
   */
  private async findOrCreateCustomer(message: WebChatMessage) {
    // Try to find by email first
    if (message.visitorEmail) {
      const customer = await this.prisma.customer.findFirst({
        where: { email: message.visitorEmail },
      });

      if (customer) {
        return customer;
      }
    }

    // Try to find by visitor ID (stored in metadata)
    const customer = await this.prisma.customer.findFirst({
      where: {
        phone: `webchat:${message.visitorId}`,
      },
    });

    if (customer) {
      return customer;
    }

    // Create new customer
    // Get organization from first available (in production, this would be determined by the website)
    const organization = await this.prisma.organization.findFirst();
    
    if (!organization) {
      throw new Error('No organization found');
    }

    return this.prisma.customer.create({
       {
        organizationId: organization.id,
        name: message.visitorName || 'Visitante',
        phone: `webchat:${message.visitorId}`,
        email: message.visitorEmail,
        address: null,
      },
    });
  }

  /**
   * Find existing conversation or create new one
   */
  private async findOrCreateConversation(customerId: string, platform: string) {
    // Find active conversation (not closed)
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        customerId,
        state: { not: 'CLOSED' },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!conversation) {
      // Get organization from customer
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });

      conversation = await this.prisma.conversation.create({
         {
          organizationId: customer!.organizationId,
          customerId,
          channel: 'WEB',
          state: 'AI_ACTIVE',
          aiEnabled: true,
          humanTakeover: false,
        },
      });

      this.logger.log(`Created new web chat conversation: ${conversation.id}`);
    }

    return conversation;
  }

  /**
   * Save message to database
   */
  private async saveMessage(
    conversationId: string,
    senderType: 'CUSTOMER' | 'AI' | 'USER' | 'SYSTEM',
    senderName: string,
    content: string,
  ) {
    await this.prisma.message.create({
       {
        conversationId,
        senderType,
        senderName,
        content,
      },
    });
  }

  /**
   * Build conversation context for AI
   */
  private async buildConversationContext(conversation: any, customer: any) {
    // Get last 10 messages for context
    const messages = await this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const conversationHistory = messages
      .reverse()
      .filter(m => m.senderType === 'CUSTOMER' || m.senderType === 'AI')
      .map(m => ({
        role: m.senderType === 'CUSTOMER' ? 'user' as const : 'assistant' as const,
        content: m.content,
      }));

    return {
      customerId: customer.id,
      customerName: customer.name,
      conversationHistory,
      organizationId: conversation.organizationId,
    };
  }

  /**
   * Handle AI response (create request, trigger handoff, etc.)
   */
  private async handleAIResponse(conversation: any, customer: any, aiResponse: any) {
    // If AI detected a service request and all fields are collected
    if (aiResponse.intent === 'REQUEST_SERVICE' && aiResponse.missingFields.length === 0) {
      await this.createServiceRequest(conversation, customer, aiResponse);
    }

    // If AI requires human handoff
    if (aiResponse.requiresHuman) {
      await this.triggerHumanHandoff(conversation, aiResponse);
    }
  }

  /**
   * Create service request from AI response
   */
  private async createServiceRequest(conversation: any, customer: any, aiResponse: any) {
    // Get default service (in production, this would be determined by AI)
    const service = await this.prisma.service.findFirst({
      where: { organizationId: conversation.organizationId },
    });

    if (!service) {
      this.logger.warn('No service found for organization');
      return;
    }

    const request = await this.prisma.serviceRequest.create({
       {
        organizationId: conversation.organizationId,
        customerId: customer.id,
        serviceId: service.id,
        state: 'NEW',
        urgency: aiResponse.urgency || 'NORMAL',
        problem: Object.values(aiResponse.extractedFields).join(', '),
        address: aiResponse.extractedFields.address || customer.address || 'A definir',
         aiResponse.extractedFields,
      },
    });

    this.logger.log(`Created service request: ${request.id}`);

    // Log to audit
    await this.auditService.log({
      organizationId: conversation.organizationId,
      actorType: 'AI',
      actorId: 'ai_engine',
      actorName: 'Assistente IA',
      action: 'CREATED_REQUEST',
      entityType: 'REQUEST',
      entityId: request.id,
      after: { state: request.state },
    });
  }

  /**
   * Trigger human handoff
   */
  private async triggerHumanHandoff(conversation: any, aiResponse: any) {
    await this.prisma.conversation.update({
      where: { id: conversation.id },
       {
        state: 'NEEDS_HUMAN',
        humanTakeover: true,
      },
    });

    this.logger.log(`Triggered human handoff for conversation: ${conversation.id}`);

    // Send system message
    await this.saveMessage(
      conversation.id,
      'SYSTEM',
      'Sistema',
      `⚠️ ${aiResponse.triggerRule || 'Handoff para humano necessário'}`,
    );

    // Log to audit
    await this.auditService.log({
      organizationId: conversation.organizationId,
      actorType: 'AI',
      actorId: 'ai_engine',
      actorName: 'Assistente IA',
      action: 'HUMAN_HANDOFF',
      entityType: 'CONVERSATION',
      entityId: conversation.id,
      after: { state: 'NEEDS_HUMAN' },
    });
  }

  /**
   * Update conversation state based on AI response
   */
  private async updateConversationState(conversationId: string, aiResponse: any) {
    let newState = 'AI_ACTIVE';

    if (aiResponse.requiresHuman) {
      newState = 'NEEDS_HUMAN';
    } else if (aiResponse.missingFields.length > 0) {
      newState = 'WAITING_CUSTOMER';
    }

    await this.prisma.conversation.update({
      where: { id: conversationId },
       {
        state: newState,
        lastMessage: aiResponse.suggestedReply,
        lastMessageAt: new Date(),
      },
    });
  }
}
