import { AIResponse, AIIntent, ToolCall } from './ai-schemas';
import { Service } from '../types';

// AI Provider abstraction
export interface AIProvider {
  name: string;
  processMessage(message: string, context: ConversationContext): Promise<AIResponse>;
}

export interface ConversationContext {
  customerId: string;
  customerName: string;
  service?: Service;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

// Mock AI Provider (simulates Groq/OpenAI)
export class MockAIProvider implements AIProvider {
  name = 'MockProvider (Groq-compatible)';
  
  async processMessage(message: string, context: ConversationContext): Promise<AIResponse> {
    const startTime = Date.now();
    
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
    
    // Analyze message
    const intent = this.analyzeIntent(message, context);
    
    // Determine which tools to call
    const toolCalls = await this.executeTools(intent, context);
    
    const totalProcessingTime = Date.now() - startTime;
    
    return {
      intent,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      totalProcessingTime,
      tokensUsed: Math.floor(message.length * 1.3 + Math.random() * 100),
      model: 'mock-llama-3.1-70b',
    };
  }
  
  private analyzeIntent(message: string, context: ConversationContext): AIIntent {
    const lowerMsg = message.toLowerCase();
    
    // Check for urgent keywords
    if (lowerMsg.includes('urgente') || lowerMsg.includes('emergência') || lowerMsg.includes('perigo')) {
      return {
        intent: 'REQUEST_SERVICE',
        confidence: 0.95,
        urgency: 'URGENT',
        extractedFields: { description: message },
        missingFields: ['address', 'phone'],
        suggestedReply: 'Entendi que é urgente. Vou escalar isto imediatamente. Pode confirmar o seu contacto e morada?',
        requiresHuman: true,
        triggerRule: 'Urgency detected → Escalation',
      };
    }
    
    // Check for complaint
    if (lowerMsg.includes('reclamação') || lowerMsg.includes('insatisfeito') || lowerMsg.includes('problema')) {
      return {
        intent: 'COMPLAINT',
        confidence: 0.88,
        extractedFields: { complaint: message },
        missingFields: [],
        suggestedReply: 'Lamento ouvir isso. Vou transferir para um supervisor que pode ajudar melhor.',
        requiresHuman: true,
        triggerRule: 'Complaint detected → Supervisor handoff',
      };
    }
    
    // Check for appointment
    if (lowerMsg.includes('marcar') || lowerMsg.includes('agendar') || lowerMsg.includes('disponibilidade')) {
      return {
        intent: 'APPOINTMENT',
        confidence: 0.92,
        extractedFields: {},
        missingFields: ['date', 'time', 'service'],
        suggestedReply: 'Claro! Posso ajudar a agendar. Que serviço precisa e quando prefere?',
        requiresHuman: false,
      };
    }
    
    // Check for FAQ
    if (lowerMsg.includes('preço') || lowerMsg.includes('horário') || lowerMsg.includes('quanto custa')) {
      return {
        intent: 'FAQ',
        confidence: 0.94,
        extractedFields: { question: message },
        missingFields: [],
        suggestedReply: 'Os nossos preços variam conforme o serviço. Posso dar-lhe um orçamento personalizado. Que tipo de serviço procura?',
        requiresHuman: false,
      };
    }
    
    // Check for greeting
    if (lowerMsg.match(/^(olá|ola|bom dia|boa tarde|boa noite|hi|hello)/)) {
      return {
        intent: 'GREETING',
        confidence: 0.99,
        extractedFields: {},
        missingFields: [],
        suggestedReply: 'Olá! Como posso ajudar hoje?',
        requiresHuman: false,
      };
    }
    
    // Default: service request
    return {
      intent: 'REQUEST_SERVICE',
      confidence: 0.75,
      extractedFields: { description: message },
      missingFields: ['service', 'address'],
      suggestedReply: 'Posso ajudar com isso. Pode dar-me mais detalhes sobre o serviço que precisa?',
      requiresHuman: false,
    };
  }
  
  private async executeTools(intent: AIIntent, context: ConversationContext): Promise<ToolCall[]> {
    const tools: ToolCall[] = [];
    
    // If we have a service context, try to get service details
    if (context.service && intent.intent === 'REQUEST_SERVICE') {
      const toolCall = await this.callTool('getServiceDetails', { serviceId: context.service.id }, context);
      tools.push(toolCall);
    }
    
    // If appointment intent, check availability
    if (intent.intent === 'APPOINTMENT') {
      const toolCall = await this.callTool('checkAvailability', { serviceId: context.service?.id }, context);
      tools.push(toolCall);
    }
    
    // If we need customer info, fetch it
    if (intent.missingFields.includes('phone') || intent.missingFields.includes('address')) {
      const toolCall = await this.callTool('getCustomerInfo', { customerId: context.customerId }, context);
      tools.push(toolCall);
    }
    
    return tools;
  }
  
  private async callTool(toolName: string, parameters: Record<string, any>, context: ConversationContext): Promise<ToolCall> {
    const startTime = Date.now();
    
    // Simulate tool execution
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    
    let result: any;
    let success = true;
    let error: string | undefined;
    
    try {
      switch (toolName) {
        case 'getServiceDetails':
          result = {
            name: 'Reparação AC',
            basePrice: 75,
            estimatedDuration: 120,
            requiredFields: ['brand', 'model', 'symptoms'],
          };
          break;
        case 'checkAvailability':
          result = {
            available: true,
            nextSlot: '2024-12-20T14:00:00Z',
            slots: ['2024-12-20T14:00:00Z', '2024-12-20T16:00:00Z', '2024-12-21T10:00:00Z'],
          };
          break;
        case 'getCustomerInfo':
          result = {
            name: context.customerName,
            phone: '+351 912 345 678',
            address: 'Rua Exemplo 123, Lisboa',
          };
          break;
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (e) {
      success = false;
      error = e instanceof Error ? e.message : 'Unknown error';
    }
    
    return {
      toolName,
      parameters,
      result,
      executionTime: Date.now() - startTime,
      success,
      error,
    };
  }
}

// AI Engine singleton
let currentProvider: AIProvider = new MockAIProvider();

export const aiEngine = {
  get provider() {
    return currentProvider;
  },
  
  async process(message: string, context: ConversationContext): Promise<AIResponse> {
    return currentProvider.processMessage(message, context);
  },
  
  setProvider(provider: AIProvider) {
    currentProvider = provider;
  },
};
