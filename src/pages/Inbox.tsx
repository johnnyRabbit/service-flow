import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertTriangle, Filter, CheckSquare, Square, Clock, Radio } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useWebhookSimulator } from '../hooks/useWebhookSimulator';
import { ConversationState, Channel } from '../types';

const stateLabels: Record<ConversationState, { label: string; color: string; dot: string }> = {
  AI_ACTIVE: { label: 'IA Ativa', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  WAITING_CUSTOMER: { label: 'A aguardar', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
  NEEDS_HUMAN: { label: 'Precisa humano', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  HUMAN_ACTIVE: { label: 'Humano ativo', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  CLOSED: { label: 'Fechada', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300' },
};

const channelIcons: Record<Channel, string> = {
  WHATSAPP: '💬',
  EMAIL: '📧',
  WEB: '🌐',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function Inbox() {
  const navigate = useNavigate();
  const { conversations, updateConversationState } = useData();
  const { isSimulating, startSimulation, stopSimulation, triggerOnce, events } = useWebhookSimulator();
  const [filter, setFilter] = useState<string>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = conversations.filter(conv => {
    if (filter !== 'ALL' && conv.state !== filter) return false;
    if (channelFilter !== 'ALL' && conv.channel !== channelFilter) return false;
    if (priorityFilter !== 'ALL' && conv.priority !== priorityFilter) return false;
    if (search && !conv.customer.name.toLowerCase().includes(search.toLowerCase()) && !conv.lastMessage.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    ALL: conversations.length,
    AI_ACTIVE: conversations.filter(c => c.state === 'AI_ACTIVE').length,
    NEEDS_HUMAN: conversations.filter(c => c.state === 'NEEDS_HUMAN').length,
    HUMAN_ACTIVE: conversations.filter(c => c.state === 'HUMAN_ACTIVE').length,
    WAITING_CUSTOMER: conversations.filter(c => c.state === 'WAITING_CUSTOMER').length,
  };

  const toggleSelect = (id: string) => {
    setSelected((s) => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const selectAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map(c => c.id));
    }
  };

  const bulkClose = () => {
    selected.forEach(id => updateConversationState(id, 'CLOSED'));
    setSelected([]);
  };

  const bulkTakeover = () => {
    selected.forEach(id => updateConversationState(id, 'HUMAN_ACTIVE', 'user_1'));
    setSelected([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-sm text-gray-500 mt-1">{conversations.filter(c => c.state !== 'CLOSED').length} conversas ativas</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={triggerOnce}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Radio className="w-4 h-4" />
            Simular mensagem
          </button>
          <button
            onClick={isSimulating ? stopSimulation : startSimulation}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isSimulating
                ? 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100'
                : 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
            {isSimulating ? 'Parar simulação' : 'Iniciar simulação'}
          </button>
        </div>
      </div>

      {/* Webhook Events Feed */}
      {events.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-xs font-semibold text-blue-900">Webhook Events (tempo real)</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {events.slice(0, 5).map((ev) => (
              <div key={ev.id} className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs ${
                ev.type === 'INCOMING_MESSAGE' ? 'bg-green-100 text-green-800' :
                ev.type === 'AI_RESPONSE' ? 'bg-blue-100 text-blue-800' :
                ev.type === 'HANDOFF' ? 'bg-red-100 text-red-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                <span className="font-medium">{ev.customerName}</span>
                <span className="opacity-70"> • {ev.content.slice(0, 40)}{ev.content.length > 40 ? '...' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar cliente ou mensagem..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
            showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Canal</label>
            <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="ALL">Todos</option>
              <option value="WHATSAPP">💬 WhatsApp</option>
              <option value="EMAIL">📧 Email</option>
              <option value="WEB">🌐 Web</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Prioridade</label>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="ALL">Todas</option>
              <option value="HIGH">🔴 Alta</option>
              <option value="NORMAL">🟡 Normal</option>
              <option value="LOW">🟢 Baixa</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Ações em lote</label>
            <div className="flex gap-2">
              <button onClick={bulkTakeover} disabled={selected.length === 0} className="flex-1 px-2 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 disabled:opacity-50">
                Assumir ({selected.length})
              </button>
              <button onClick={bulkClose} disabled={selected.length === 0} className="flex-1 px-2 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100 disabled:opacity-50">
                Fechar ({selected.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { key: 'ALL', label: 'Todas' },
          { key: 'AI_ACTIVE', label: '🤖 IA Ativa' },
          { key: 'NEEDS_HUMAN', label: '🚨 Precisa Humano' },
          { key: 'HUMAN_ACTIVE', label: '👤 Humano Ativo' },
          { key: 'WAITING_CUSTOMER', label: '⏳ A aguardar' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label} ({counts[f.key as keyof typeof counts] || 0})
          </button>
        ))}
      </div>

      {/* Conversations List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <button onClick={selectAll} className="text-gray-400 hover:text-gray-600">
              {selected.length === filtered.length && filtered.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-primary-600" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
            <span className="text-xs text-gray-500">{filtered.length} conversas</span>
            {selected.length > 0 && (
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full ml-2">
                {selected.length} selecionada(s)
              </span>
            )}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Nenhuma conversa encontrada</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((conv) => {
              const isSelected = selected.includes(conv.id);
              const lastMsgTime = timeAgo(conv.lastMessageAt);
              const isUrgent = conv.priority === 'HIGH';
              const slaMinutes = Math.floor((Date.now() - new Date(conv.lastMessageAt).getTime()) / 60000);

              return (
                <div
                  key={conv.id}
                  className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => navigate(`/inbox/${conv.id}`)}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(conv.id); }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-primary-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <div className="relative">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ${
                      conv.state === 'NEEDS_HUMAN' ? 'bg-red-100 text-red-700' :
                      conv.state === 'AI_ACTIVE' ? 'bg-blue-100 text-blue-700' :
                      conv.state === 'HUMAN_ACTIVE' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {conv.customer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${stateLabels[conv.state].dot}`}></div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{conv.customer.name}</span>
                      <span className="text-xs">{channelIcons[conv.channel]}</span>
                      {isUrgent && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                      {slaMinutes > 30 && conv.state !== 'CLOSED' && (
                        <span className="flex items-center gap-0.5 text-xs text-orange-600">
                          <Clock className="w-3 h-3" />
                          {slaMinutes}m
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-400">{lastMsgTime}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stateLabels[conv.state].color}`}>
                      {stateLabels[conv.state].label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
