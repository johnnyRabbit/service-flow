import { useState } from 'react';
import { Send, Bot, User, Zap, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { processMessage, AIIntent } from '../lib/ai-simulator';

export function WebhookTester() {
  const { conversations, customers, services, addMessage, createRequest, updateConversationState } = useData();
  const [selectedConv, setSelectedConv] = useState(conversations[0]?.id || '');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastIntent, setLastIntent] = useState<AIIntent | null>(null);
  const [logs, setLogs] = useState<{ type: 'in' | 'ai' | 'action'; content: string; timestamp: string }[]>([]);

  const conv = conversations.find((c) => c.id === selectedConv);

  const handleSend = async () => {
    if (!message.trim() || !conv) return;
    setIsProcessing(true);
    const msgText = message;
    setMessage('');

    // Log incoming message (as customer)
    addMessage(conv.id, { senderType: 'CUSTOMER', senderName: conv.customer.name, content: msgText });
    setLogs((l) => [...l, { type: 'in', content: msgText, timestamp: new Date().toLocaleTimeString('pt-PT') }]);

    // Process with AI
    const intent = await processMessage(msgText, services[0]);
    setLastIntent(intent);

    // AI reply
    addMessage(conv.id, { senderType: 'AI', senderName: 'Assistente IA', content: intent.suggestedReply });
    setLogs((l) => [...l, { type: 'ai', content: `Intent: ${intent.intent} (${Math.round(intent.confidence * 100)}%)`, timestamp: new Date().toLocaleTimeString('pt-PT') }]);

    // Handle actions
    if (intent.requiresHuman) {
      updateConversationState(conv.id, 'NEEDS_HUMAN');
      addMessage(conv.id, { senderType: 'SYSTEM', senderName: 'Sistema', content: `⚠️ ${intent.triggerRule}` });
      setLogs((l) => [...l, { type: 'action', content: `Handoff → ${intent.triggerRule}`, timestamp: new Date().toLocaleTimeString('pt-PT') }]);
    }

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
        setLogs((l) => [...l, { type: 'action', content: 'Pedido criado automaticamente', timestamp: new Date().toLocaleTimeString('pt-PT') }]);
      } catch (e) {
        // ignore
      }
    }

    setIsProcessing(false);
  };

  const quickMessages = [
    'Olá, preciso de ajuda',
    'O meu ar condicionado Daikin não arrefece',
    'Sinto um cheiro a queimado quando ligo o AC',
    'Quanto custa uma manutenção?',
    'Quero marcar uma instalação',
    'É um Samsung modelo AR12, não liga',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teste de Webhook WhatsApp</h1>
        <p className="text-sm text-gray-500 mt-1">Simule mensagens de clientes e veja a IA a processar em tempo real</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Simulator */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-[600px]">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-green-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">💬</span>
              </div>
              <div>
                <select
                  value={selectedConv}
                  onChange={(e) => setSelectedConv(e.target.value)}
                  className="text-sm font-semibold text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer"
                >
                  {conversations.map((c) => (
                    <option key={c.id} value={c.id}>{c.customer.name}</option>
                  ))}
                </select>
                <p className="text-xs text-green-700">WhatsApp • Simulação</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {conv?.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderType === 'CUSTOMER' ? 'justify-end' : msg.senderType === 'SYSTEM' ? 'justify-center' : 'justify-start'}`}>
                {msg.senderType === 'SYSTEM' ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5">
                    <p className="text-xs text-yellow-800">{msg.content}</p>
                  </div>
                ) : (
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                    msg.senderType === 'CUSTOMER'
                      ? 'bg-green-500 text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 rounded-bl-sm'
                  }`}>
                    <p className={`text-sm ${msg.senderType === 'CUSTOMER' ? 'text-white' : 'text-gray-900'}`}>{msg.content}</p>
                    <p className={`text-xs mt-0.5 ${msg.senderType === 'CUSTOMER' ? 'text-green-100' : 'text-gray-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2 mb-3 flex-wrap">
              {quickMessages.map((qm) => (
                <button
                  key={qm}
                  onClick={() => setMessage(qm)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                >
                  {qm}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escreva uma mensagem como cliente..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleSend}
                disabled={isProcessing || !message.trim()}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Enviar
              </button>
            </div>
          </div>
        </div>

        {/* AI Output Panel */}
        <div className="space-y-4">
          {/* Last Intent */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary-500" />
              Structured Output (IA)
            </h3>
            {lastIntent ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Intent</span>
                  <span className="text-xs font-mono font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded">{lastIntent.intent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Confiança</span>
                  <span className="text-xs font-medium text-gray-900">{Math.round(lastIntent.confidence * 100)}%</span>
                </div>
                {lastIntent.urgency && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Urgência</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      lastIntent.urgency === 'URGENT' ? 'bg-red-100 text-red-700' :
                      lastIntent.urgency === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{lastIntent.urgency}</span>
                  </div>
                )}
                {Object.keys(lastIntent.extractedFields).length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Campos extraídos</span>
                    <div className="bg-gray-50 rounded p-2 space-y-1">
                      {Object.entries(lastIntent.extractedFields).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs">
                          <span className="text-gray-500">{k}:</span>
                          <span className="font-medium text-gray-900">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {lastIntent.missingFields.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Em falta</span>
                    <div className="flex flex-wrap gap-1">
                      {lastIntent.missingFields.map((f) => (
                        <span key={f} className="text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
                {lastIntent.requiresHuman && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-medium text-red-700">Requer humano</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Envie uma mensagem para ver o output da IA</p>
            )}
          </div>

          {/* Processing Logs */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Logs de Processamento
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Sem logs ainda</p>
              ) : (
                logs.slice().reverse().map((log, i) => (
                  <div key={i} className={`flex items-start gap-2 text-xs p-2 rounded ${
                    log.type === 'in' ? 'bg-green-50' :
                    log.type === 'ai' ? 'bg-blue-50' :
                    'bg-yellow-50'
                  }`}>
                    <span className="text-gray-400 font-mono">{log.timestamp}</span>
                    <span className={
                      log.type === 'in' ? 'text-green-700' :
                      log.type === 'ai' ? 'text-blue-700' :
                      'text-yellow-700'
                    }>{log.content}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-800">
              <strong>Como funciona:</strong> Esta simulação replica o fluxo do webhook WhatsApp → AI Engine → Tools → Database.
              Em produção, cada mensagem passa por classificação de intenção, extração de dados estruturados (Zod validation),
              execução de tools e registo no audit log.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
