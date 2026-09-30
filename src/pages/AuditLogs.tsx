import { useState } from 'react';
import { Shield, Bot, User, Monitor, Search } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ActorType } from '../types';

const actorIcons: Record<ActorType, any> = {
  AI: Bot,
  USER: User,
  SYSTEM: Monitor,
};

const actorColors: Record<ActorType, string> = {
  AI: 'bg-blue-100 text-blue-700',
  USER: 'bg-green-100 text-green-700',
  SYSTEM: 'bg-gray-100 text-gray-700',
};

const actionLabels: Record<string, string> = {
  CREATED_REQUEST: 'Criou pedido',
  CREATED_CUSTOMER: 'Criou cliente',
  CREATED_SERVICE: 'Criou serviço',
  CREATED_APPOINTMENT: 'Criou marcação',
  UPDATED_REQUEST: 'Atualizou pedido',
  UPDATED_CUSTOMER: 'Atualizou cliente',
  UPDATED_SERVICE: 'Atualizou serviço',
  UPDATED_CONVERSATION_STATE: 'Atualizou estado conversa',
  UPDATED_ORGANIZATION: 'Atualizou organização',
  TRIGGERED_RULE: 'Regra ativada',
  UPDATED_STATUS: 'Atualizou estado',
  SENT_REMINDER: 'Enviou lembrete',
  FOLLOW_UP_SENT: 'Follow-up enviado',
  HUMAN_HANDOFF: 'Handoff para humano',
  MESSAGE_SENT: 'Mensagem enviada',
  DELETED_CUSTOMER: 'Removeu cliente',
};

export function AuditLogs() {
  const { auditLogs } = useData();
  const [filterActor, setFilterActor] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filtered = auditLogs.filter(log => {
    if (filterActor !== 'ALL' && log.actorType !== filterActor) return false;
    if (search && !log.action.toLowerCase().includes(search.toLowerCase()) && !log.actorName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">{auditLogs.length} registos de auditoria</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar ações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {[
            { key: 'ALL', label: 'Todos' },
            { key: 'AI', label: '🤖 IA' },
            { key: 'USER', label: '👤 Utilizador' },
            { key: 'SYSTEM', label: '⚙️ Sistema' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterActor(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterActor === f.key
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ação</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Entidade</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Detalhes</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((log) => {
              const ActorIcon = actorIcons[log.actorType];
              return (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${actorColors[log.actorType]}`}>
                        <ActorIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.actorName}</p>
                        <p className="text-xs text-gray-500">{log.actorType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700">{actionLabels[log.action] || log.action}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-700">{log.entityType}</p>
                      <p className="text-xs text-gray-400 font-mono">{log.entityId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {log.before && (
                        <span className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">
                          {JSON.stringify(log.before)}
                        </span>
                      )}
                      {log.before && log.after && <span className="text-gray-300">→</span>}
                      {log.after && (
                        <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded">
                          {JSON.stringify(log.after)}
                        </span>
                      )}
                      {!log.before && !log.after && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString('pt-PT', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                  Nenhum registo encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900">Sobre o Audit Log</h4>
            <p className="text-xs text-blue-700 mt-1">
              Todas as ações no sistema são registadas automaticamente: criações, atualizações, eliminações, 
              handoffs de IA para humano, e execução de regras. Isto garante total transparência e permite 
              investigar qualquer comportamento do sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
