import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, UserCheck, AlertTriangle, CheckCircle, Paperclip, MoreVertical, Loader2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { processMessage } from '../lib/ai-simulator';

export function ConversationDetail() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { conversations, services, addMessage, updateConversationState, createRequest } = useData();
  const [newMessage, setNewMessage] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [lastIntent, setLastIntent] = useState<any>(null);

  const conversation = conversations.find(c => c.id === conversationId) || conversations[0];
  if (!conversation) {
    return <div className="p-12 text-center text-gray-500">Conversa não encontrada</div>;
  }

  const handleTakeover = () => {
    updateConversationState(conversation.id, 'HUMAN_ACTIVE', 'user_1');
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const msgText = newMessage;
    setNewMessage('');
    
    // Send as user
    addMessage(conversation.id, { senderType: 'USER', senderName: 'Você', content: msgText });

    // If AI is active, simulate AI response
    if (conversation.state === 'AI_ACTIVE' || conversation.state === 'WAITING_CUSTOMER') {
      setIsAiProcessing(true);
      const intent = await processMessage(msgText, services[0]);
      setLastIntent(intent);
      
      addMessage(conversation.id, { senderType: 'AI', senderName: 'Assistente IA', content: intent.suggestedReply });
      
      if (intent.requiresHuman) {
        updateConversationState(conversation.id, 'NEEDS_HUMAN');
        addMessage(conversation.id, { senderType: 'SYSTEM', senderName: 'Sistema', content: `⚠️ ${intent.triggerRule}` });
      }
      
      // If all fields collected, create request
      if (intent.intent === 'REQUEST_SERVICE' && intent.missingFields.length === 0) {
        try {
          createRequest({
            customerId: conversation.customerId,
            serviceId: services[0].id,
            state: 'NEW',
            urgency: intent.urgency || 'NORMAL',
            problem: Object.values(intent.extractedFields).join(', '),
            address: conversation.customer.address || 'A definir',
            data: intent.extractedFields,
            attachments: [],
          });
        } catch (e) {}
      }
      
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] -m-6">
      {/* Conversation Area */}
      <div className="flex-1 flex flex-col border-r border-gray-200">
        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/inbox')} className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-700">
                {conversation.customer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{conversation.customer.name}</p>
                <p className="text-xs text-gray-500">{conversation.customer.phone}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              conversation.state === 'AI_ACTIVE' ? 'bg-blue-100 text-blue-700' :
              conversation.state === 'NEEDS_HUMAN' ? 'bg-red-100 text-red-700' :
              conversation.state === 'HUMAN_ACTIVE' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {conversation.state === 'AI_ACTIVE' ? '🤖 IA Ativa' :
               conversation.state === 'NEEDS_HUMAN' ? '🚨 Precisa Humano' :
               conversation.state === 'HUMAN_ACTIVE' ? '👤 Humano' :
               conversation.state === 'WAITING_CUSTOMER' ? '⏳ A aguardar' : 'Fechada'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {conversation.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderType === 'CUSTOMER' ? 'justify-start' : msg.senderType === 'SYSTEM' ? 'justify-center' : 'justify-end'}`}>
              {msg.senderType === 'SYSTEM' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 max-w-md">
                  <p className="text-xs text-yellow-800">{msg.content}</p>
                </div>
              ) : (
                <div className="max-w-[70%]">
                  <div className={`px-4 py-2.5 rounded-2xl ${
                    msg.senderType === 'CUSTOMER' 
                      ? 'bg-white border border-gray-200 rounded-bl-sm' 
                      : msg.senderType === 'AI'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-green-600 text-white rounded-br-sm'
                  }`}>
                    <p className={`text-sm ${msg.senderType === 'CUSTOMER' ? 'text-gray-900' : 'text-white'}`}>
                      {msg.content}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 ${msg.senderType === 'CUSTOMER' ? '' : 'justify-end'}`}>
                    <span className="text-xs text-gray-400">
                      {msg.senderType === 'AI' && '🤖 '}{msg.senderName}
                    </span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isAiProcessing && (
            <div className="flex justify-start">
              <div className="bg-primary-600 text-white px-4 py-2.5 rounded-2xl rounded-br-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">IA a processar...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-gray-600">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={conversation.state === 'HUMAN_ACTIVE' ? 'Escreva uma mensagem...' : 'Escreva para simular resposta...'}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || isAiProcessing}
              className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 bg-white overflow-y-auto">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cliente</h3>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">{conversation.customer.name}</p>
              <p className="text-sm text-gray-600">{conversation.customer.phone}</p>
              {conversation.customer.email && <p className="text-sm text-gray-600">{conversation.customer.email}</p>}
              {conversation.customer.address && <p className="text-sm text-gray-600">{conversation.customer.address}</p>}
            </div>
          </div>

          {/* Last AI Intent */}
          {lastIntent && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Última Análise IA</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-blue-700">Intent</span>
                  <span className="text-xs font-mono font-medium text-blue-900">{lastIntent.intent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-blue-700">Confiança</span>
                  <span className="text-xs font-medium text-blue-900">{Math.round(lastIntent.confidence * 100)}%</span>
                </div>
                {Object.keys(lastIntent.extractedFields).length > 0 && (
                  <div className="pt-2 border-t border-blue-200">
                    <span className="text-xs text-blue-700 block mb-1">Extraído</span>
                    {Object.entries(lastIntent.extractedFields).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-blue-600">{k}</span>
                        <span className="font-medium text-blue-900">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {lastIntent.requiresHuman && (
                  <div className="flex items-center gap-1 pt-2 border-t border-blue-200">
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                    <span className="text-xs font-medium text-red-700">Handoff necessário</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ações</h3>
            <div className="space-y-2">
              {conversation.state !== 'HUMAN_ACTIVE' && (
                <button
                  onClick={handleTakeover}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium hover:bg-green-100 transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  Assumir conversa
                </button>
              )}
              <button
                onClick={() => updateConversationState(conversation.id, 'CLOSED')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Marcar como resolvido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
