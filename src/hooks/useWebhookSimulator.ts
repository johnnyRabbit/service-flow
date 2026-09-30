import { useState, useEffect, useCallback, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import { processMessage } from '../lib/ai-simulator';

const sampleCustomerMessages = [
  'Olá, o meu ar condicionado começou a fazer um barulho estranho',
  'Bom dia, preciso de uma manutenção urgente',
  'O AC não liga, já verifiquei o disjuntor',
  'Quanto custa instalar um AC novo num escritório?',
  'Tenho uma fuga de água na unidade exterior',
  'O meu Daikin está a pingar água para dentro de casa',
  'Preciso de um orçamento para 3 splits',
  'Sinto um cheiro estranho quando ligo o AC',
  'O controlo remoto não funciona',
  'Queria agendar uma limpeza preventiva',
  'O ar condicionado não arrefece como antes',
  'A unidade exterior está a vibrar muito',
];

const sampleCustomerNames = [
  'Rui Almeida', 'Mariana Costa', 'Tiago Ferreira', 'Beatriz Santos',
  'Diogo Silva', 'Inês Rodrigues', 'Francisco Oliveira', 'Catarina Martins',
];

export interface WebhookEvent {
  id: string;
  type: 'INCOMING_MESSAGE' | 'AI_RESPONSE' | 'REQUEST_CREATED' | 'HANDOFF';
  conversationId: string;
  customerName: string;
  content: string;
  timestamp: string;
}

export function useWebhookSimulator() {
  const { conversations, customers, services, addMessage, createRequest, updateConversationState } = useData();
  const { addToast } = useToast();
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const simulateIncomingMessage = useCallback(async () => {
    if (conversations.length === 0) return;

    // Pick a random conversation (prefer non-closed ones)
    const activeConvs = conversations.filter(c => c.state !== 'CLOSED');
    const pool = activeConvs.length > 0 ? activeConvs : conversations;
    const conv = pool[Math.floor(Math.random() * pool.length)];

    const message = sampleCustomerMessages[Math.floor(Math.random() * sampleCustomerMessages.length)];

    // Log incoming webhook event
    const eventId = Math.random().toString(36).slice(2);
    const event: WebhookEvent = {
      id: eventId,
      type: 'INCOMING_MESSAGE',
      conversationId: conv.id,
      customerName: conv.customer.name,
      content: message,
      timestamp: new Date().toISOString(),
    };
    setEvents((e) => [event, ...e].slice(0, 20));

    // Add message to conversation
    addMessage(conv.id, {
      senderType: 'CUSTOMER',
      senderName: conv.customer.name,
      content: message,
    });

    addToast({
      type: 'info',
      title: '📩 Nova mensagem WhatsApp',
      message: `${conv.customer.name}: ${message.slice(0, 50)}${message.length > 50 ? '...' : ''}`,
    });

    // Simulate AI processing delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));

    // Process with AI
    const intent = await processMessage(message, services[0]);

    // AI response event
    const aiEvent: WebhookEvent = {
      id: Math.random().toString(36).slice(2),
      type: 'AI_RESPONSE',
      conversationId: conv.id,
      customerName: 'Assistente IA',
      content: intent.suggestedReply,
      timestamp: new Date().toISOString(),
    };
    setEvents((e) => [aiEvent, ...e].slice(0, 20));

    addMessage(conv.id, {
      senderType: 'AI',
      senderName: 'Assistente IA',
      content: intent.suggestedReply,
    });

    // Handle special cases
    if (intent.requiresHuman) {
      updateConversationState(conv.id, 'NEEDS_HUMAN');
      addMessage(conv.id, {
        senderType: 'SYSTEM',
        senderName: 'Sistema',
        content: `⚠️ ${intent.triggerRule}`,
      });
      const handoffEvent: WebhookEvent = {
        id: Math.random().toString(36).slice(2),
        type: 'HANDOFF',
        conversationId: conv.id,
        customerName: 'Sistema',
        content: intent.triggerRule || 'Handoff para humano',
        timestamp: new Date().toISOString(),
      };
      setEvents((e) => [handoffEvent, ...e].slice(0, 20));
      addToast({
        type: 'warning',
        title: '🚨 Handoff automático',
        message: intent.triggerRule || 'Conversa encaminhada para humano',
      });
    }

    // Create request if all fields collected
    if (intent.intent === 'REQUEST_SERVICE' && intent.missingFields.length === 0) {
      try {
        createRequest({
          customerId: conv.customerId,
          serviceId: services[0].id,
          state: 'NEW',
          urgency: intent.urgency || 'NORMAL',
          problem: Object.values(intent.extractedFields).join(', '),
          address: conv.customer.address || 'A definir',
          data: intent.extractedFields,
          attachments: [],
        });
        const reqEvent: WebhookEvent = {
          id: Math.random().toString(36).slice(2),
          type: 'REQUEST_CREATED',
          conversationId: conv.id,
          customerName: 'Assistente IA',
          content: 'Pedido criado automaticamente',
          timestamp: new Date().toISOString(),
        };
        setEvents((e) => [reqEvent, ...e].slice(0, 20));
        addToast({
          type: 'success',
          title: '✅ Pedido criado pela IA',
          message: `${conv.customer.name} — ${services[0].name}`,
        });
      } catch (e) {}
    }
  }, [conversations, customers, services, addMessage, createRequest, updateConversationState, addToast]);

  const startSimulation = useCallback(() => {
    setIsSimulating(true);
    // Immediate first message
    simulateIncomingMessage();
    // Then every 8-15 seconds
    intervalRef.current = setInterval(() => {
      simulateIncomingMessage();
    }, 8000 + Math.random() * 7000);
  }, [simulateIncomingMessage]);

  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const triggerOnce = useCallback(() => {
    simulateIncomingMessage();
  }, [simulateIncomingMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    events,
    isSimulating,
    startSimulation,
    stopSimulation,
    triggerOnce,
    clearEvents: () => setEvents([]),
  };
}
