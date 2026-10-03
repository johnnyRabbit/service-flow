import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { z } from 'zod';

// Zod schemas for AI output validation
const IntentSchema = z.object({
  intent: z.enum(['REQUEST_SERVICE', 'FAQ', 'APPOINTMENT', 'GREETING', 'COMPLAINT', 'UNKNOWN']),
  confidence: z.number().min(0).max(1),
  service: z.string().optional(),
  urgency: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  extractedFields: z.record(z.string()),
  missingFields: z.array(z.string()),
  suggestedReply: z.string(),
  requiresHuman: z.boolean(),
  triggerRule: z.string().optional(),
});

export type AIIntent = z.infer<typeof IntentSchema>;

export interface ConversationContext {
  customerId: string;
  customerName: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  organizationId: string;
  serviceId?: string;
}

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private groq: Groq;
  private model: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY not configured, AI features will be disabled');
    }

    this.groq = new Groq({ apiKey: apiKey || 'dummy' });
    this.model = this.configService.get<string>('GROQ_MODEL', 'llama-3.1-70b-versatile');
  }

  /**
   * Process a customer message and return structured AI response
   */
  async processMessage(message: string, context: ConversationContext): Promise<AIIntent> {
    try {
      const startTime = Date.now();
      
      // Build conversation history for context
      const messages = this.buildMessages(message, context);

      // Call Groq API
      const completion = await this.groq.chat.completions.create({
        messages,
        model: this.model,
        temperature: 0.3,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from Groq API');
      }

      // Parse and validate response
      const parsed = JSON.parse(response);
      const validated = IntentSchema.parse(parsed);

      const processingTime = Date.now() - startTime;
      this.logger.log(`AI processed message in ${processingTime}ms: ${validated.intent} (${Math.round(validated.confidence * 100)}% confidence)`);

      return validated;
    } catch (error) {
      this.logger.error('Error processing message with Groq:', error);
      
      // Return fallback response
      return {
        intent: 'UNKNOWN',
        confidence: 0.5,
        extractedFields: {},
        missingFields: [],
        suggestedReply: 'Desculpe, estou com dificuldades técnicas. Um dos nossos técnicos irá contactá-lo em breve.',
        requiresHuman: true,
        triggerRule: 'AI_ERROR_FALLBACK',
      };
    }
  }

  /**
   * Build message array for Groq API call
   */
  private buildMessages(customerMessage: string, context: ConversationContext): any[] {
    const systemPrompt = this.buildSystemPrompt(context);

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    // Add conversation history
    for (const msg of context.conversationHistory.slice(-10)) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: customerMessage,
    });

    return messages;
  }

  /**
   * Build system prompt with context
   */
  private buildSystemPrompt(context: ConversationContext): string {
    return `Você é um assistente de atendimento ao cliente para uma empresa de serviços técnicos (AVAC, eletricidade, canalização).

CONTEXTO:
- Cliente: ${context.customerName}
- Organização ID: ${context.organizationId}
${context.serviceId ? `- Serviço de interesse: ${context.serviceId}` : ''}

OBJETIVO:
1. Identificar a intenção do cliente (pedido de serviço, FAQ, agendamento, reclamação, etc.)
2. Extrair informações estruturadas (marca, modelo, sintomas, morada, etc.)
3. Determinar se a situação requer intervenção humana urgente
4. Sugerir uma resposta apropriada

REGRAS:
- Se detetar "cheiro a queimado", "faísca", "perigo" → requiresHuman: true, urgency: URGENT
- Se for uma reclamação → requiresHuman: true
- Se for um pedido de serviço, recolher progressivamente: marca, modelo, sintomas, morada, fotos
- Responder sempre em português de Portugal
- Ser empático e profissional

FORMATO DE RESPOSTA (JSON):
{
  "intent": "REQUEST_SERVICE|FAQ|APPOINTMENT|GREETING|COMPLAINT|UNKNOWN",
  "confidence": 0.0-1.0,
  "service": "nome do serviço se aplicável",
  "urgency": "LOW|NORMAL|HIGH|URGENT",
  "extractedFields": {"campo": "valor"},
  "missingFields": ["campo1", "campo2"],
  "suggestedReply": "resposta ao cliente",
  "requiresHuman": true|false,
  "triggerRule": "descrição da regra se aplicável"
}`;
  }

  /**
   * Check if Groq is properly configured
   */
  isConfigured(): boolean {
    return !!this.configService.get<string>('GROQ_API_KEY');
  }
}
