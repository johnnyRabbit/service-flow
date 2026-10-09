import { Controller, Post, Get, Body, Headers, Query, Logger, HttpCode } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsAppService } from './whatsapp.service';
import { QueueService } from '../queue/queue.service';

@Controller('webhooks/whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(
    private configService: ConfigService,
    private whatsappService: WhatsAppService,
    private queueService: QueueService,
  ) {}

  /**
   * Webhook verification endpoint (GET)
   * Meta sends this to verify the webhook URL
   */
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const expectedToken = this.configService.get<string>('WHATSAPP_VERIFY_TOKEN');

    if (mode === 'subscribe' && verifyToken === expectedToken) {
      this.logger.log('Webhook verified successfully');
      return challenge;
    }

    this.logger.warn('Webhook verification failed');
    throw new Error('Verification failed');
  }

  /**
   * Webhook receiver endpoint (POST)
   * Meta sends incoming messages here
   */
  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Body() body: any,
    @Headers('x-hub-signature-256') signature: string,
  ) {
    try {
      // 🔒 CRITICAL: Signature verification is MANDATORY in production
      const payload = JSON.stringify(body);
      
      if (!signature) {
        this.logger.error('❌ Missing webhook signature - rejecting request');
        return { status: 'error', message: 'Missing signature' };
      }

      if (!this.whatsappService.verifyWebhookSignature(payload, signature)) {
        this.logger.error('❌ Invalid webhook signature - rejecting request');
        return { status: 'error', message: 'Invalid signature' };
      }

      // Process the webhook payload
      await this.processWebhookPayload(body);

      return { status: 'ok' };
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Process incoming webhook payload from WhatsApp
   */
  private async processWebhookPayload(payload: any): Promise<void> {
    // WhatsApp sends updates in this structure
    if (payload.object !== 'whatsapp_business_account') {
      this.logger.warn('Unexpected webhook payload structure');
      return;
    }

    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') {
          continue;
        }

        const value = change.value;

        // Handle incoming messages
        if (value.messages) {
          for (const message of value.messages) {
            await this.handleIncomingMessage(message, value);
          }
        }

        // Handle message status updates (delivered, read, etc.)
        if (value.statuses) {
          for (const status of value.statuses) {
            await this.handleMessageStatus(status);
          }
        }
      }
    }
  }

  /**
   * Handle incoming WhatsApp message
   */
  private async handleIncomingMessage(message: any, metadata: any): Promise<void> {
    const from = message.from; // Customer phone number
    const messageId = message.id;
    const timestamp = message.timestamp;

    this.logger.log(`Incoming message from ${from}: ${messageId}`);

    // Extract message content
    let messageText = '';
    
    if (message.type === 'text') {
      messageText = message.text?.body || '';
    } else if (message.type === 'image') {
      messageText = '[Imagem recebida]';
      // TODO: Download and process image
    } else if (message.type === 'document') {
      messageText = '[Documento recebido]';
      // TODO: Download and process document
    } else if (message.type === 'audio') {
      messageText = '[Áudio recebido]';
      // TODO: Transcribe audio
    } else {
      messageText = `[${message.type} recebido]`;
    }

    // Add message to queue for async processing
    await this.queueService.addMessageToQueue({
      from,
      messageId,
      timestamp,
      text: messageText,
      metadata,
    });

    this.logger.log(`Message ${messageId} added to queue for processing`);
  }

  /**
   * Handle message status updates
   */
  private async handleMessageStatus(status: any): Promise<void> {
    const messageId = status.id;
    const statusType = status.status; // sent, delivered, read, failed
    const recipientId = status.recipient_id;

    this.logger.log(`Message ${messageId} status: ${statusType}`);

    // TODO: Update message status in database
    // This is useful for tracking delivery and read receipts
  }
}
