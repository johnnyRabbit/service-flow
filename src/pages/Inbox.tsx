import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertTriangle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ConversationState, Channel } from '../types';

const stateLabels: Record<ConversationState, { label: string; color: string }> = {
  AI_ACTIVE: { label: 'IA Ativa', color: 'bg-blue-100 text-blue-700' },
  WAITING_CUSTOMER: { label: 'A aguardar', color: 'bg-gray-100 text-gray-700' },
  NEEDS_HUMAN: { label: 'Precisa humano', color: 'bg-red-100 text-red-700' },
  HUMAN_ACTIVE: { label: 'Humano ativo', color: 'bg-green-100 text-green-700' },
  CLOSED: { label: 'Fechada', color: 'bg-gray-100 text-gray-500' },
};

const channelIcons: Record<Channel, string> = {
  WHATSAPP: '💬',
  EMAIL: '📧',
  WEB: '🌐',
};

export function Inbox() {
  const navigate = useNavigate();
  const { conversations } = useData();
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(conv => {
    if (filter !== 'ALL' && conv.state !== filter) return false;
    if (search && !conv.customer.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    ALL: conversations.length,
    AI_ACTIVE: conversations.filter(c => c.state === 'AI_ACTIVE').length,
    NEEDS_HUMAN: conversations.filter(c => c.state === 'NEEDS_HUMAN').length,
    HUMAN_ACTIVE: conversations.filter(c => c.state === 'HUMAN_ACTIVE').length,
    WAITING_CUSTOMER: conversations.filter(c => c.state === 'WAITING_CUSTOMER').length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-sm text-gray-500 mt-1">{conversations.filter(c => c.state !== 'CLOSED').length} conversas ativas</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Nenhuma conversa encontrada</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => navigate(`/inbox/${conv.id}`)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="relative">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ${
                    conv.state === 'NEEDS_HUMAN' ? 'bg-red-100 text-red-700' :
                    conv.state === 'AI_ACTIVE' ? 'bg-blue-100 text-blue-700' :
                    conv.state === 'HUMAN_ACTIVE' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {conv.customer.name.split(' ').map(n => n[0]).join('')}
                  </div>
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
                    {conv.priority === 'HIGH' && (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(conv.lastMessageAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stateLabels[conv.state].color}`}>
                    {stateLabels[conv.state].label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
