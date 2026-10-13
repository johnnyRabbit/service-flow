import { Controller, Get, Post, Body, Headers, Query, Logger, HttpCode } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessengerService } from './messenger.service';

@Controller('webhooks/messenger')
export class MessengerController {
  private readonly logger = new Logger(MessengerController.name);

  constructor(
    private configService: ConfigService,
    private messengerService: MessengerService,
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
    const expectedToken = this.configService.get<string>('MESSENGER_VERIFY_TOKEN');

    if (mode === 'subscribe' && verifyToken === expectedToken) {
      this.logger.log('Messenger webhook verified successfully');
      return challenge;
    }

    this.logger.warn('Messenger webhook verification failed');
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
    @Headers('x-hub-signature') signature: string,
  ) {
    try {
      // Verify signature (optional but recommended)
      const payload = JSON.stringify(body);
      if (signature && !this.messengerService.verifyWebhookSignature(payload, signature)) {
        this.logger.warn('Invalid webhook signature');
        return { status: 'error', message: 'Invalid signature' };
      }

      // Process the webhook payload
      await this.processWebhookPayload(body);

      return { status: 'ok' };
    } catch (error) {
      this.logger.error('Error processing Messenger webhook:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Process incoming webhook payload from Messenger
   */
  private async processWebhookPayload(payload: any): Promise<void> {
    if (payload.object !== 'page') {
      this.logger.warn('Unexpected webhook payload structure');
      return;
    }

    for (const entry of payload.entry || []) {
      for (const messagingEvent of entry.messaging || []) {
        // Handle incoming messages
        if (messagingEvent.message && !messagingEvent.message.is_echo) {
          await this.handleIncomingMessage(messagingEvent);
        }

        // Handle message delivery receipts
        if (messagingEvent.delivery) {
          this.logger.log(`Message delivered to ${messagingEvent.sender.id}`);
        }

        // Handle message reads
        if (messagingEvent.read) {
          this.logger.log(`Message read by ${messagingEvent.sender.id}`);
        }
      }
    }
  }

  /**
   * Handle incoming Messenger message
   */
  private async handleIncomingMessage(event: any): Promise<void> {
    const senderId = event.sender.id;
    const recipientId = event.recipient.id;
    const messageId = event.message.mid;
    const timestamp = event.timestamp;

    this.logger.log(`Incoming Messenger message from ${senderId}: ${messageId}`);

    // Extract message content
    let messageText = '';
    
    if (event.message.text) {
      messageText = event.message.text;
    } else if (event.message.attachments) {
      // Handle attachments (images, files, etc.)
      messageText = '[Anexo recebido]';
      // TODO: Download and process attachments
    } else {
      messageText = '[Mensagem não suportada]';
    }

    // Process message through AI
    await this.messengerService.processMessage({
      senderId,
      recipientId,
      messageId,
      message: messageText,
      timestamp: new Date(timestamp).toISOString(),
    });
  }
}
