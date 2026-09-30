import { Service } from '../types';

// Simulates AI structured output from Groq/OpenAI
// In production, this would call the real API with Zod validation

export interface AIIntent {
  intent: 'REQUEST_SERVICE' | 'FAQ' | 'APPOINTMENT' | 'GREETING' | 'COMPLAINT' | 'UNKNOWN';
  confidence: number;
  service?: string;
  urgency?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  extractedFields: Record<string, string>;
  missingFields: string[];
  suggestedReply: string;
  requiresHuman: boolean;
  triggerRule?: string;
}

// Pattern matching for demo purposes
const BRAND_PATTERNS = ['daikin', 'mitsubishi', 'samsung', 'lg', 'panasonic', 'bosch', 'siemens'];
const SYMPTOM_PATTERNS = [
  { keywords: ['não arrefece', 'não aquece', 'não funciona'], label: 'Não funciona' },
  { keywords: ['ruído', 'barulho', 'faz barulho'], label: 'Faz ruído' },
  { keywords: ['pinga', 'água', 'fuga'], label: 'Pinga água' },
  { keywords: ['cheiro', 'queimado', 'queimada'], label: 'Cheiro estranho', urgent: true },
  { keywords: ['não liga', 'não arranca'], label: 'Não liga' },
  { keywords: ['instalar', 'instalação', 'novo'], label: 'Instalação' },
  { keywords: ['manutenção', 'limpeza', 'revisão'], label: 'Manutenção' },
];

export function classifyIntent(message: string, service?: Service): AIIntent {
  const lowerMsg = message.toLowerCase();
  
  // Check for urgent rules
  const urgentSymptom = SYMPTOM_PATTERNS.find(p => p.urgent && p.keywords.some(k => lowerMsg.includes(k)));
  if (urgentSymptom) {
    return {
      intent: 'REQUEST_SERVICE',
      confidence: 0.95,
      service: service?.name || 'Serviço',
      urgency: 'URGENT',
      extractedFields: { symptoms: urgentSymptom.label },
      missingFields: ['brand', 'model', 'address', 'photos'],
      suggestedReply: '⚠️ Detectei uma situação que pode ser urgente. Vou passar a conversa a um técnico imediatamente para avaliar com segurança. Pode desligar o equipamento entretanto?',
      requiresHuman: true,
      triggerRule: 'Cheiro a queimado detectado → Handoff imediato',
    };
  }

  // Detect brands
  const detectedBrand = BRAND_PATTERNS.find(b => lowerMsg.includes(b));
  
  // Detect symptoms
  const detectedSymptom = SYMPTOM_PATTERNS.find(p => p.keywords.some(k => lowerMsg.includes(k)));

  // Greeting
  if (/^(olá|ola|bom dia|boa tarde|boa noite|hi|hello)/.test(lowerMsg)) {
    return {
      intent: 'GREETING',
      confidence: 0.98,
      extractedFields: {},
      missingFields: [],
      suggestedReply: 'Olá! 👋 Sou o assistente da ClimaTech. Como posso ajudar hoje? Pode descrever o problema ou o serviço que precisa.',
      requiresHuman: false,
    };
  }

  // FAQ
  if (lowerMsg.includes('preço') || lowerMsg.includes('quanto custa') || lowerMsg.includes('orçamento')) {
    return {
      intent: 'FAQ',
      confidence: 0.89,
      extractedFields: {},
      missingFields: [],
      suggestedReply: `Os nossos preços começam em €${service?.basePrice || 50} para uma visita de diagnóstico. O valor final depende do serviço necessário. Quer que agende uma visita para avaliar?`,
      requiresHuman: false,
    };
  }

  // Appointment
  if (lowerMsg.includes('marcar') || lowerMsg.includes('agendar') || lowerMsg.includes('marcação')) {
    return {
      intent: 'APPOINTMENT',
      confidence: 0.92,
      extractedFields: {},
      missingFields: ['service', 'date', 'time'],
      suggestedReply: 'Claro! Para agendar, preciso saber: que serviço precisa e qual a sua disponibilidade nos próximos dias?',
      requiresHuman: false,
    };
  }

  // Service request with extracted data
  if (detectedBrand || detectedSymptom || lowerMsg.includes('problema') || lowerMsg.includes('avaria')) {
    const extracted: Record<string, string> = {};
    if (detectedBrand) extracted.brand = detectedBrand.charAt(0).toUpperCase() + detectedBrand.slice(1);
    if (detectedSymptom) extracted.symptoms = detectedSymptom.label;

    // Try to extract model (word after brand or "modelo")
    const modelMatch = lowerMsg.match(/modelo\s+([a-z0-9]+)/i);
    if (modelMatch) extracted.model = modelMatch[1].toUpperCase();

    const missing: string[] = [];
    if (!extracted.brand) missing.push('brand');
    if (!extracted.symptoms) missing.push('symptoms');
    missing.push('address', 'photos');

    return {
      intent: 'REQUEST_SERVICE',
      confidence: 0.87,
      service: service?.name || 'Reparação',
      urgency: 'NORMAL',
      extractedFields: extracted,
      missingFields: missing,
      suggestedReply: buildReplyForMissing(missing, extracted),
      requiresHuman: false,
    };
  }

  // Default
  return {
    intent: 'UNKNOWN',
    confidence: 0.5,
    extractedFields: {},
    missingFields: [],
    suggestedReply: 'Pode dar-me mais detalhes sobre o que precisa? Assim consigo ajudar melhor.',
    requiresHuman: false,
  };
}

function buildReplyForMissing(missing: string[], extracted: Record<string, string>): string {
  const parts: string[] = [];
  
  if (extracted.brand || extracted.symptoms) {
    parts.push('Obrigado pela informação! ✓');
  }

  if (missing.includes('brand') && !extracted.brand) {
    return 'Para agilizar o atendimento, pode dizer-me qual é a marca do equipamento? (Ex: Daikin, Mitsubishi, Samsung...)';
  }
  if (missing.includes('symptoms') && !extracted.symptoms) {
    return 'Obrigado! E o que está a acontecer exatamente? Por exemplo: não arrefece, faz ruído, pinga água, não liga...';
  }
  if (missing.includes('address')) {
    return 'Perfeito! Agora preciso da morada onde está o equipamento para podermos agendar a visita.';
  }
  if (missing.includes('photos')) {
    return 'Excelente! Por fim, pode enviar uma foto da unidade (interior e exterior)? Ajuda-nos a preparar a intervenção.';
  }

  return 'Obrigado! Vou criar o seu pedido e um técnico irá contactá-lo em breve.';
}

// Simulate async AI processing
export async function processMessage(message: string, service?: Service): Promise<AIIntent> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));
  return classifyIntent(message, service);
}
