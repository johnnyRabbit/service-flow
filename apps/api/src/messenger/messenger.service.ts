import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { GroqService } from '../ai/groq.service';
import { AuditService } from '../audit/audit.service';

export interface MessengerMessage {
  senderId: string;
  recipientId: string;
  messageId: string;
  message: string;
  timestamp: string;
}

@Injectable()
export class MessengerService {
  private readonly logger = new Logger(MessengerService.name);
  private readonly apiUrl = 'https://graph.facebook.com/v18.0';
  private pageAccessToken: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private prisma: PrismaService,
    private groqService: GroqService,
    private auditService: AuditService,
  ) {
    this.pageAccessToken = this.configService.get<string>('MESSENGER_PAGE_ACCESS_TOKEN') || '';
  }

  /**
   * Send a text message via Messenger
   */
  async sendTextMessage(recipientId: string, text: string): Promise<any> {
    try {
      const url = `${this.apiUrl}/me/messages?access_token=${this.pageAccessToken}`;
      
      const response = await firstValueFrom(
        this.httpService.post(url, {
          recipient: { id: recipientId },
          message: { text },
        }),
      );

      this.logger.log(`Message sent to ${recipientId}: ${response.data.message_id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Error sending Messenger message:', error);
      throw error;
    }
  }

  /**
   * Process incoming Messenger message
   */
  async processMessage(message: MessengerMessage) {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Processing Messenger message from ${message.senderId}`);

      // 1. Find or create customer
      const customer = await this.findOrCreateCustomer(message.senderId);

      // 2. Find or create conversation
      const conversation = await this.findOrCreateConversation(customer.id);

      // 3. Save incoming message
      await this.saveMessage(conversation.id, 'CUSTOMER', customer.name, message.message);

      // 4. Build conversation context for AI
      const context = await this.buildConversationContext(conversation, customer);

      // 5. Process with AI
      const aiResponse = await this.groqService.processMessage(message.message, context);

      // 6. Handle AI response
      await this.handleAIResponse(conversation, customer, aiResponse);

      // 7. Save AI response as message
      await this.saveMessage(conversation.id, 'AI', 'Assistente IA', aiResponse.suggestedReply);

      // 8. Send response via Messenger
      await this.sendTextMessage(message.senderId, aiResponse.suggestedReply);

      // 9. Update conversation state
      await this.updateConversationState(conversation.id, aiResponse);

      // 10. Log to audit
      await this.auditService.log({
        organizationId: conversation.organizationId,
        actorType: 'AI',
        actorId: 'ai_engine',
        actorName: 'Assistente IA',
        action: 'PROCESSED_MESSENGER_MESSAGE',
        entityType: 'CONVERSATION',
        entityId: conversation.id,
        after: {
          intent: aiResponse.intent,
          confidence: aiResponse.confidence,
          processingTime: Date.now() - startTime,
        },
      });

      this.logger.log(`Messenger message processed in ${Date.now() - startTime}ms`);
    } catch (error) {
      this.logger.error('Error processing Messenger message:', error);
      
      // Send fallback message
      await this.sendTextMessage(
        message.senderId,
        'Desculpe, estou com dificuldades técnicas. Um dos nossos técnicos irá contactá-lo em breve.',
      );
    }
  }

  /**
   * Find existing customer or create new one based on Messenger user ID
   */
  private async findOrCreateCustomer(senderId: string) {
    // Try to find by Messenger ID (stored in phone field with prefix)
    const customer = await this.prisma.customer.findFirst({
      where: {
        phone: `messenger:${senderId}`,
      },
    });

    if (customer) {
      return customer;
    }

    // Get user profile from Messenger API
    let userName = 'Utilizador Facebook';
    try {
      const profileUrl = `${this.apiUrl}/${senderId}?fields=first_name,last_name&access_token=${this.pageAccessToken}`;
      const response = await firstValueFrom(this.httpService.get(profileUrl));
      userName = `${response.data.first_name} ${response.data.last_name}`;
    } catch (error) {
      this.logger.warn('Could not fetch Messenger user profile');
    }

    // Create new customer
    const organization = await this.prisma.organization.findFirst();
    
    if (!organization) {
      throw new Error('No organization found');
    }

    return this.prisma.customer.create({
       {
        organizationId: organization.id,
        name: userName,
        phone: `messenger:${senderId}`,
        email: null,
        address: null,
      },
    });
  }

  /**
   * Find existing conversation or create new one
   */
  private async findOrCreateConversation(customerId: string) {
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
          channel: 'WEB', // Using WEB channel for Messenger
          state: 'AI_ACTIVE',
          aiEnabled: true,
          humanTakeover: false,
        },
      });

      this.logger.log(`Created new Messenger conversation: ${conversation.id}`);
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
    // Get default service
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

  /**
   * Verify webhook signature (for security)
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const appSecret = this.configService.get<string>('MESSENGER_APP_SECRET');
    
    if (!appSecret) {
      this.logger.warn('MESSENGER_APP_SECRET not configured, skipping signature verification');
      return true;
    }

    const expectedSignature = crypto
      .createHmac('sha1', appSecret)
      .update(payload)
      .digest('hex');

    return `sha1=${expectedSignature}` === signature;
  }
}
