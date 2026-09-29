import { useState } from 'react';
import { Search, Filter, MoreHorizontal, Calendar, MapPin, User, Clock, AlertCircle } from 'lucide-react';
import { mockRequests } from '../data/mockData';
import { RequestState } from '../types';

const stateConfig: Record<RequestState, { label: string; color: string; bg: string }> = {
  NEW: { label: 'Novo', color: 'text-blue-700', bg: 'bg-blue-100' },
  REVIEWING: { label: 'A rever', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  QUOTE_PENDING: { label: 'Orçamento pendente', color: 'text-orange-700', bg: 'bg-orange-100' },
  QUOTED: { label: 'Orçamentado', color: 'text-purple-700', bg: 'bg-purple-100' },
  SCHEDULED: { label: 'Agendado', color: 'text-green-700', bg: 'bg-green-100' },
  IN_PROGRESS: { label: 'Em progresso', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  COMPLETED: { label: 'Concluído', color: 'text-gray-700', bg: 'bg-gray-100' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-100' },
};

export function Requests() {
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const filtered = filter === 'ALL' ? mockRequests : mockRequests.filter(r => r.state === filter);
  const selected = mockRequests.find(r => r.id === selectedRequest);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">Pedidos criados pela IA e equipa</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { key: 'ALL', label: 'Todos' },
          { key: 'NEW', label: 'Novos' },
          { key: 'REVIEWING', label: 'A rever' },
          { key: 'QUOTED', label: 'Orçamentados' },
          { key: 'SCHEDULED', label: 'Agendados' },
          { key: 'IN_PROGRESS', label: 'Em progresso' },
          { key: 'COMPLETED', label: 'Concluídos' },
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
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filtered.map((req) => (
              <button
                key={req.id}
                onClick={() => setSelectedRequest(req.id)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedRequest === req.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stateConfig[req.state].bg} ${stateConfig[req.state].color}`}>
                      {stateConfig[req.state].label}
                    </span>
                    {req.urgency === 'HIGH' && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">Urgente</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(req.createdAt).toLocaleDateString('pt-PT')}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">{req.customer.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{req.service.name}</p>
                <p className="text-xs text-gray-500 truncate">{req.problem}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{req.address.split(',')[0]}</span>
                  {req.assignedUser && (
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{req.assignedUser.name.split(' ')[0]}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-96 bg-white rounded-xl border border-gray-200 p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-14rem)]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Detalhes do Pedido</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${stateConfig[selected.state].bg} ${stateConfig[selected.state].color}`}>
                  {stateConfig[selected.state].label}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium text-gray-900">{selected.customer.name}</p>
                <p className="text-xs text-gray-600">{selected.customer.phone}</p>
                <p className="text-xs text-gray-600">{selected.customer.address}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Serviço</h4>
              <p className="text-sm text-gray-900">{selected.service.name}</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Problema</h4>
              <p className="text-sm text-gray-700">{selected.problem}</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dados Recolhidos pela IA</h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                {Object.entries(selected.data).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 capitalize">{key}</span>
                    <span className="text-xs font-medium text-gray-900">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selected.scheduledDate && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Agendamento</h4>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{selected.scheduledDate} às {selected.scheduledTime}</span>
                </div>
              </div>
            )}

            {selected.assignedUser && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Atribuído a</h4>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-700">{selected.assignedUser.name.charAt(0)}</span>
                  </div>
                  <span className="text-sm text-gray-900">{selected.assignedUser.name}</span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200 space-y-2">
              <button className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                Atualizar Estado
              </button>
              <button className="w-full px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Enviar Orçamento
              </button>
              <button className="w-full px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Agendar Visita
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
