import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, UserCheck, Bot, AlertTriangle, CheckCircle, Clock, Paperclip, MoreVertical } from 'lucide-react';
import { mockConversations } from '../data/mockData';

export function ConversationDetail() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const [showTakeover, setShowTakeover] = useState(false);

  const conversation = mockConversations.find(c => c.id === conversationId) || mockConversations[0];

  const handleTakeover = () => {
    setShowTakeover(true);
    setTimeout(() => setShowTakeover(false), 3000);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] -m-6">
      {/* Conversation Area */}
      <div className="flex-1 flex flex-col border-r border-gray-200">
        {/* Header */}
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
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {conversation.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderType === 'CUSTOMER' ? 'justify-start' : msg.senderType === 'SYSTEM' ? 'justify-center' : 'justify-end'}`}>
              {msg.senderType === 'SYSTEM' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 max-w-md">
                  <p className="text-xs text-yellow-800">{msg.content}</p>
                </div>
              ) : (
                <div className={`max-w-[70%] ${msg.senderType === 'CUSTOMER' ? '' : ''}`}>
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

          {showTakeover && (
            <div className="flex justify-center">
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <p className="text-xs text-green-800 font-medium">✅ Você assumiu esta conversa</p>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-gray-600">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={conversation.state === 'HUMAN_ACTIVE' ? 'Escreva uma mensagem...' : 'Assuma a conversa para responder...'}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Context */}
      <div className="w-80 bg-white overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cliente</h3>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">{conversation.customer.name}</p>
              <p className="text-sm text-gray-600">{conversation.customer.phone}</p>
              {conversation.customer.email && <p className="text-sm text-gray-600">{conversation.customer.email}</p>}
              {conversation.customer.address && <p className="text-sm text-gray-600">{conversation.customer.address}</p>}
              <p className="text-xs text-gray-400 mt-2">{conversation.customer.totalRequests} pedidos anteriores</p>
            </div>
          </div>

          {/* AI Status */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Estado IA</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary-500" />
                <span className="text-sm text-gray-700">IA a recolher dados</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Marca</span>
                  <span className="text-xs font-medium text-gray-900">Daikin ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Modelo</span>
                  <span className="text-xs font-medium text-gray-900">FTXM25 ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Sintomas</span>
                  <span className="text-xs font-medium text-gray-900">Não arrefece ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Morada</span>
                  <span className="text-xs text-yellow-600">A aguardar...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Fotos</span>
                  <span className="text-xs text-yellow-600">A aguardar...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
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
              <button className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-100 transition-colors">
                <CheckCircle className="w-4 h-4" />
                Marcar como resolvido
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium hover:bg-red-100 transition-colors">
                <AlertTriangle className="w-4 h-4" />
                Escalar urgência
              </button>
            </div>
          </div>

          {/* Audit */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Atividade</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-xs text-gray-700">IA iniciou recolha de dados</p>
                  <p className="text-xs text-gray-400">14:20</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-xs text-gray-700">Marca e modelo identificados</p>
                  <p className="text-xs text-gray-400">14:22</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-xs text-gray-700">A aguardar morada e fotos</p>
                  <p className="text-xs text-gray-400">14:22</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
