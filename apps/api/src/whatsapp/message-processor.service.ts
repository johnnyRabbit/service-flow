import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroqService, ConversationContext } from '../ai/groq.service';
import { WhatsAppService } from './whatsapp.service';
import { AuditService } from '../audit/audit.service';

export interface IncomingMessage {
  from: string; // Customer phone number
  messageId: string;
  timestamp: string;
  text: string;
  metadata?: any;
}

@Injectable()
export class MessageProcessorService {
  private readonly logger = new Logger(MessageProcessorService.name);

  constructor(
    private prisma: PrismaService,
    private groqService: GroqService,
    private whatsappService: WhatsAppService,
    private auditService: AuditService,
  ) {}

  /**
   * Process incoming WhatsApp message
   * This is the main orchestration method
   */
  async processIncomingMessage(message: IncomingMessage): Promise<void> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Processing message from ${message.from}`);

      // 1. Find or create customer
      const customer = await this.findOrCreateCustomer(message.from);

      // 2. Find or create conversation
      const conversation = await this.findOrCreateConversation(customer.id, message.metadata);

      // 3. Save incoming message
      await this.saveMessage(conversation.id, 'CUSTOMER', customer.name, message.text);

      // 4. Build conversation context for AI
      const context = await this.buildConversationContext(conversation, customer);

      // 5. Process with AI
      const aiResponse = await this.groqService.processMessage(message.text, context);

      // 6. Handle AI response
      await this.handleAIResponse(conversation, customer, aiResponse);

      // 7. Save AI response as message
      await this.saveMessage(conversation.id, 'AI', 'Assistente IA', aiResponse.suggestedReply);

      // 8. Send response via WhatsApp
      await this.whatsappService.sendTextMessage(message.from, aiResponse.suggestedReply);

      // 9. Update conversation state
      await this.updateConversationState(conversation.id, aiResponse);

      // 10. Log to audit
      await this.auditService.log({
        organizationId: conversation.organizationId,
        actorType: 'AI',
        actorId: 'ai_engine',
        actorName: 'Assistente IA',
        action: 'PROCESSED_MESSAGE',
        entityType: 'CONVERSATION',
        entityId: conversation.id,
        after: {
          intent: aiResponse.intent,
          confidence: aiResponse.confidence,
          processingTime: Date.now() - startTime,
        },
      });

      this.logger.log(`Message processed in ${Date.now() - startTime}ms`);
    } catch (error) {
      this.logger.error('Error processing message:', error);
      
      // Send fallback message
      await this.whatsappService.sendTextMessage(
        message.from,
        'Desculpe, estou com dificuldades técnicas. Um dos nossos técnicos irá contactá-lo em breve.',
      );
    }
  }

  /**
   * Find existing customer or create new one
   */
  private async findOrCreateCustomer(phoneNumber: string) {
    let customer = await this.prisma.customer.findFirst({
      where: { phone: phoneNumber },
    });

    if (!customer) {
      // Get organization from metadata or use default
      // In production, this would be determined by the WhatsApp Business Account
      const organizationId = 'org_default'; // TODO: Get from metadata
      
      customer = await this.prisma.customer.create({
         {
          organizationId,
          phone: phoneNumber,
          name: 'Cliente', // Will be updated when AI extracts name
        },
      });

      this.logger.log(`Created new customer: ${customer.id}`);
    }

    return customer;
  }

  /**
   * Find existing conversation or create new one
   */
  private async findOrCreateConversation(customerId: string, metadata?: any) {
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
          channel: 'WHATSAPP',
          state: 'AI_ACTIVE',
          aiEnabled: true,
          humanTakeover: false,
        },
      });

      this.logger.log(`Created new conversation: ${conversation.id}`);
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
  private async buildConversationContext(conversation: any, customer: any): Promise<ConversationContext> {
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
    let newState = conversation.state;

    if (aiResponse.requiresHuman) {
      newState = 'NEEDS_HUMAN';
    } else if (aiResponse.missingFields.length > 0) {
      newState = 'WAITING_CUSTOMER';
    } else {
      newState = 'AI_ACTIVE';
    }

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        state: newState,
        lastMessage: aiResponse.suggestedReply,
        lastMessageAt: new Date(),
      },
    });
  }
}
