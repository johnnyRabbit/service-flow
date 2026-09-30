export interface QuickReply {
  id: string;
  label: string;
  content: string;
  category: 'greeting' | 'pricing' | 'scheduling' | 'followup' | 'closing';
  emoji?: string;
}

export const quickReplies: QuickReply[] = [
  {
    id: 'qr_1',
    label: 'Saudação',
    content: 'Olá! 👋 Como posso ajudar hoje?',
    category: 'greeting',
    emoji: '👋',
  },
  {
    id: 'qr_2',
    label: 'Pedir marca',
    content: 'Para agilizar o atendimento, pode dizer-me qual é a marca do equipamento?',
    category: 'greeting',
    emoji: '🏷️',
  },
  {
    id: 'qr_3',
    label: 'Pedir sintomas',
    content: 'O que está a acontecer exatamente? Não arrefece, faz ruído, pinga água, não liga...',
    category: 'greeting',
    emoji: '🔍',
  },
  {
    id: 'qr_4',
    label: 'Preço base',
    content: 'Os nossos preços começam em €50 para visita de diagnóstico. O valor final depende do serviço.',
    category: 'pricing',
    emoji: '💰',
  },
  {
    id: 'qr_5',
    label: 'Pedir morada',
    content: 'Precisamos da morada para agendar a visita. Pode indicar a zona?',
    category: 'scheduling',
    emoji: '📍',
  },
  {
    id: 'qr_6',
    label: 'Pedir fotos',
    content: 'Pode enviar uma foto da unidade (interior e exterior)? Ajuda-nos a preparar a intervenção.',
    category: 'scheduling',
    emoji: '📸',
  },
  {
    id: 'qr_7',
    label: 'Agendar',
    content: 'Temos disponibilidade amanhã às 10h ou 14h. Qual prefere?',
    category: 'scheduling',
    emoji: '📅',
  },
  {
    id: 'qr_8',
    label: 'Follow-up',
    content: 'Olá! Ainda precisa de ajuda com o seu pedido? Estamos disponíveis.',
    category: 'followup',
    emoji: '🔔',
  },
  {
    id: 'qr_9',
    label: 'Encerrar',
    content: 'Obrigado pelo contacto! Qualquer coisa, estamos disponíveis. Tenha um bom dia! 👍',
    category: 'closing',
    emoji: '✅',
  },
  {
    id: 'qr_10',
    label: 'Transferir',
    content: 'Vou transferir a conversa para um técnico especializado. Um momento por favor.',
    category: 'followup',
    emoji: '👨‍🔧',
  },
];
