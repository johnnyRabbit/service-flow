import { Controller, Post, Body, Logger } from '@nestjs/common';
import { WebChatService, WebChatMessage } from './webchat.service';

@Controller('webhooks/webchat')
export class WebChatController {
  private readonly logger = new Logger(WebChatController.name);

  constructor(private webChatService: WebChatService) {}

  /**
   * Generic web chat webhook endpoint
   * Works with Tawk.to, Crisp, Tidio, or any custom web chat
   */
  @Post()
  async handleWebhook(@Body() body: any) {
    try {
      this.logger.log('Received web chat webhook');

      // Parse message based on platform
      const message = this.parseMessage(body);

      // Process message
      const result = await this.webChatService.processMessage(message);

      return {
        success: true,
        reply: result.reply,
        intent: result.intent,
        requiresHuman: result.requiresHuman,
      };
    } catch (error) {
      this.logger.error('Error processing web chat webhook:', error);
      
      return {
        success: false,
        error: error.message,
        reply: 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
      };
    }
  }

  /**
   * Parse incoming webhook message from different platforms
   */
  private parseMessage(body: any): WebChatMessage {
    // Detect platform from webhook structure
    if (body.event === 'messageCreated' && body.widget) {
      // Tawk.to format
      return {
        visitorId: body.visitor.id || body.visitor._id,
        visitorName: body.visitor.name,
        visitorEmail: body.visitor.email,
        chatId: body.chat.id || body.chat._id,
        message: body.body,
        timestamp: body.createdAt,
        platform: 'tawk',
      };
    }

    if (body.type === 'message' && body.website_id) {
      // Crisp format
      return {
        visitorId: body.from.user_id || body.session_id,
        visitorName: body.from.nickname,
        visitorEmail: body.from.email,
        chatId: body.session_id,
        message: body.content,
        timestamp: new Date(body.date).toISOString(),
        platform: 'crisp',
      };
    }

    if (body.event === 'message.created' && body.app) {
      // Tidio format
      return {
        visitorId: body.visitor.id,
        visitorName: body.visitor.name || body.visitor.email,
        visitorEmail: body.visitor.email,
        chatId: body.conversation.id,
        message: body.message.body,
        timestamp: body.message.date,
        platform: 'tidio',
      };
    }

    // Custom/generic format
    return {
      visitorId: body.visitorId || body.visitor_id || body.user_id,
      visitorName: body.visitorName || body.name,
      visitorEmail: body.visitorEmail || body.email,
      chatId: body.chatId || body.chat_id || body.conversation_id,
      message: body.message || body.text || body.content,
      timestamp: body.timestamp || new Date().toISOString(),
      platform: body.platform || 'custom',
    };
  }
}
