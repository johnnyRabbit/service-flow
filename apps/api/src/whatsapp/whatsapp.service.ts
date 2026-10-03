import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'image' | 'document';
  text?: { body: string };
  template?: {
    name: string;
    language: { code: string };
    components?: any[];
  };
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly apiUrl: string;
  private readonly accessToken: string;
  private readonly phoneNumberId: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiUrl = 'https://graph.facebook.com/v18.0';
    this.accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN') || '';
    this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '';

    if (!this.accessToken || !this.phoneNumberId) {
      this.logger.warn('WhatsApp credentials not configured');
    }
  }

  /**
   * Send a text message via WhatsApp Cloud API
   */
  async sendTextMessage(to: string, text: string): Promise<any> {
    const message: WhatsAppMessage = {
      to,
      type: 'text',
      text: { body: text },
    };

    return this.sendMessage(message);
  }

  /**
   * Send a template message via WhatsApp Cloud API
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    language: string = 'pt_PT',
    components?: any[],
  ): Promise<any> {
    const message: WhatsAppMessage = {
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: language },
        components,
      },
    };

    return this.sendMessage(message);
  }

  /**
   * Generic send message method
   */
  private async sendMessage(message: WhatsAppMessage): Promise<any> {
    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      
      const response = await firstValueFrom(
        this.httpService.post(url, message, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`Message sent to ${message.to}: ${response.data.messages?.[0]?.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature (for security)
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const secret = this.configService.get<string>('WHATSAPP_WEBHOOK_SECRET');
    
    if (!secret) {
      this.logger.warn('WHATSAPP_WEBHOOK_SECRET not configured, skipping signature verification');
      return true;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return `sha256=${expectedSignature}` === signature;
  }

  /**
   * Check if WhatsApp is properly configured
   */
  isConfigured(): boolean {
    return !!this.accessToken && !!this.phoneNumberId;
  }
}
