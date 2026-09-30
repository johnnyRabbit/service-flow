import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, UserCheck, AlertTriangle, CheckCircle, Paperclip, 
  Loader2, Image as ImageIcon, FileText, Mic, StickyNote, Plus,
  MessageSquare, Clock, Zap, User
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import { processMessage } from '../lib/ai-simulator';
import { TypingIndicator } from '../components/ui/TypingIndicator';
import { quickReplies } from '../data/quickReplies';

interface InternalNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export function ConversationDetail() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { conversations, services, addMessage, updateConversationState, createRequest } = useData();
  const { addToast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [lastIntent, setLastIntent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'context' | 'notes' | 'stats'>('context');
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [attachments, setAttachments] = useState<{ name: string; type: string; url: string }[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [assignedTo, setAssignedTo] = useState<string>('');

  const conversation = conversations.find(c => c.id === conversationId) || conversations[0];
  if (!conversation) {
    return <div className="p-12 text-center text-gray-500">Conversa não encontrada</div>;
  }

  const handleTakeover = () => {
    updateConversationState(conversation.id, 'HUMAN_ACTIVE', 'user_1');
    setAssignedTo('Você');
  };

  const handleTransfer = (agent: string) => {
    setAssignedTo(agent);
    addMessage(conversation.id, {
      senderType: 'SYSTEM',
      senderName: 'Sistema',
      content: `🔄 Conversa transferida para ${agent}`,
    });
    addToast({ type: 'info', title: 'Conversa transferida', message: `Atribuída a ${agent}` });
  };

  const handleAddAttachment = () => {
    const mockAttachments = [
      { name: 'foto_unidade.jpg', type: 'image', url: '#' },
      { name: 'fatura.pdf', type: 'document', url: '#' },
      { name: 'audio_mensagem.mp3', type: 'audio', url: '#' },
    ];
    const random = mockAttachments[Math.floor(Math.random() * mockAttachments.length)];
    setAttachments([...attachments, random]);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: InternalNote = {
      id: Math.random().toString(36).slice(2),
      author: 'Você',
      content: newNote,
      timestamp: new Date().toISOString(),
    };
    setNotes([note, ...notes]);
    setNewNote('');
    addToast({ type: 'success', title: 'Nota adicionada' });
  };

  const handleSend = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    const msgText = newMessage;
    setNewMessage('');
    const currentAttachments = [...attachments];
    setAttachments([]);
    
    // Build message content with attachments
    let fullContent = msgText;
    if (currentAttachments.length > 0) {
      fullContent += `\n📎 ${currentAttachments.map(a => a.name).join(', ')}`;
    }

    // Send as user
    addMessage(conversation.id, {
      senderType: 'USER',
      senderName: 'Você',
      content: fullContent,
    });

    // If AI is active, simulate AI response
    if ((conversation.state === 'AI_ACTIVE' || conversation.state === 'WAITING_CUSTOMER') && msgText) {
      setIsAiProcessing(true);
      const intent = await processMessage(msgText, services[0]);
      setLastIntent(intent);
      
      // Simulate typing delay
      await new Promise((r) => setTimeout(r, 500));
      
      addMessage(conversation.id, {
        senderType: 'AI',
        senderName: 'Assistente IA',
        content: intent.suggestedReply,
      });
      
      if (intent.requiresHuman) {
        updateConversationState(conversation.id, 'NEEDS_HUMAN');
        addMessage(conversation.id, {
          senderType: 'SYSTEM',
          senderName: 'Sistema',
          content: `⚠️ ${intent.triggerRule}`,
        });
      }
      
      // Create request if all fields collected
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
          addToast({
            type: 'success',
            title: '✅ Pedido criado pela IA',
            message: `${conversation.customer.name} — ${services[0].name}`,
          });
        } catch (e) {}
      }
      
      setIsAiProcessing(false);
    }
  };

  const handleQuickReply = (content: string) => {
    setNewMessage(content);
    setShowQuickReplies(false);
  };

  // Calculate conversation stats
  const totalMessages = conversation.messages.length;
  const customerMessages = conversation.messages.filter(m => m.senderType === 'CUSTOMER').length;
  const aiMessages = conversation.messages.filter(m => m.senderType === 'AI').length;
  const duration = Math.floor((Date.now() - new Date(conversation.messages[0]?.timestamp || Date.now()).getTime()) / 60000);

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

        {/* Messages */}
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
                    <p className={`text-sm whitespace-pre-wrap ${msg.senderType === 'CUSTOMER' ? 'text-gray-900' : 'text-white'}`}>
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
          
          {isAiProcessing && <TypingIndicator isTyping={true} name="Assistente IA" variant="ai" />}
        </div>

        {/* Quick Replies */}
        {showQuickReplies && (
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-semibold text-gray-700">Respostas Rápidas</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((qr) => (
                <button
                  key={qr.id}
                  onClick={() => handleQuickReply(qr.content)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors"
                >
                  {qr.emoji} {qr.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Paperclip className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-700">Anexos ({attachments.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {attachments.map((att, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                  {att.type === 'image' ? <ImageIcon className="w-3 h-3 text-blue-500" /> :
                   att.type === 'document' ? <FileText className="w-3 h-3 text-red-500" /> :
                   <Mic className="w-3 h-3 text-purple-500" />}
                  <span className="text-xs text-gray-700">{att.name}</span>
                  <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500">×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={handleAddAttachment} className="text-gray-400 hover:text-gray-600" title="Anexar ficheiro">
              <Paperclip className="w-5 h-5" />
            </button>
            <button onClick={() => setShowQuickReplies(!showQuickReplies)} className={`p-1.5 rounded ${showQuickReplies ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:text-gray-600'}`} title="Respostas rápidas">
              <Zap className="w-4 h-4" />
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
              disabled={(!newMessage.trim() && attachments.length === 0) || isAiProcessing}
              className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 bg-white overflow-y-auto">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('context')}
            className={`flex-1 px-3 py-3 text-xs font-medium transition-colors ${
              activeTab === 'context' ? 'text-primary-700 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Contexto
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 px-3 py-3 text-xs font-medium transition-colors relative ${
              activeTab === 'notes' ? 'text-primary-700 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Notas
            {notes.length > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                {notes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 px-3 py-3 text-xs font-medium transition-colors ${
              activeTab === 'stats' ? 'text-primary-700 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Stats
          </button>
        </div>

        <div className="p-4 space-y-5">
          {activeTab === 'context' && (
            <>
              {/* Customer Info */}
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
                    {lastIntent.missingFields.length > 0 && (
                      <div className="pt-2 border-t border-blue-200">
                        <span className="text-xs text-blue-700 block mb-1">Em falta</span>
                        <div className="flex flex-wrap gap-1">
                          {lastIntent.missingFields.map((f: string) => (
                            <span key={f} className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">{f}</span>
                          ))}
                        </div>
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

              {/* Transfer */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Transferir para</h3>
                <select
                  value={assignedTo}
                  onChange={(e) => handleTransfer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecionar agente...</option>
                  <option value="Carlos Técnico">Carlos Técnico</option>
                  <option value="Ana Gestora">Ana Gestora</option>
                  <option value="Pedro Supervisor">Pedro Supervisor</option>
                </select>
                {assignedTo && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Atribuído a {assignedTo}
                  </p>
                )}
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
                  <button
                    onClick={() => updateConversationState(conversation.id, 'CLOSED')}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Marcar como resolvido
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'notes' && (
            <>
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <StickyNote className="w-3.5 h-3.5" />
                  Notas Internas
                </h3>
                <div className="space-y-2 mb-3">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Adicionar nota privada (não visível para o cliente)..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="w-full py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Nota
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {notes.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-4">Sem notas ainda</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-yellow-900">{note.author}</span>
                        <span className="text-xs text-yellow-700">
                          {new Date(note.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-yellow-800">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'stats' && (
            <>
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Estatísticas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-600 flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3" /> Total mensagens
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{totalMessages}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-600">Do cliente</span>
                    <span className="text-sm font-semibold text-gray-900">{customerMessages}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-600">Da IA</span>
                    <span className="text-sm font-semibold text-gray-900">{aiMessages}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-600 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Duração
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{duration} min</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-600 flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Canal
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {conversation.channel === 'WHATSAPP' ? '💬 WhatsApp' : conversation.channel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Performance IA</h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Resolução automática</span>
                      <span className="font-medium text-gray-900">78%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Satisfação</span>
                      <span className="font-medium text-gray-900">4.7/5</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
