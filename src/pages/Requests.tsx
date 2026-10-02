import { useState } from 'react';
import { MapPin, User, Plus } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { usePermission } from '../hooks/usePermission';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from '../components/ui/Modal';
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

const stateFlow: RequestState[] = ['NEW', 'REVIEWING', 'QUOTE_PENDING', 'QUOTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'];

export function Requests() {
  const { requests, customers, services, updateRequest, createRequest } = useData();
  const { can } = usePermission();
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ customerId: '', serviceId: '', problem: '', address: '', urgency: 'NORMAL' as const });

  // Filter requests based on permissions
  const canViewAll = can('requests:view_all');
  const canViewAssigned = can('requests:view_assigned');
  
  let filtered = filter === 'ALL' ? requests : requests.filter(r => r.state === filter);
  
  // Apply permission filter
  if (!canViewAll && canViewAssigned) {
    filtered = filtered.filter(r => r.assignedUserId === user?.id);
  }
  
  const selected = requests.find(r => r.id === selectedRequest);

  const handleStateChange = (id: string, newState: RequestState) => {
    updateRequest(id, { state: newState });
  };

  const handleCreate = () => {
    if (!createForm.customerId || !createForm.serviceId || !createForm.problem) return;
    const req = createRequest({
      customerId: createForm.customerId,
      serviceId: createForm.serviceId,
      state: 'NEW',
      urgency: createForm.urgency as any,
      problem: createForm.problem,
      address: createForm.address,
      data: {},
      attachments: [],
    });
    setShowCreate(false);
    setSelectedRequest(req.id);
    setCreateForm({ customerId: '', serviceId: '', problem: '', address: '', urgency: 'NORMAL' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">{requests.length} pedidos • {requests.filter(r => r.state === 'NEW').length} novos</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Pedido
        </button>
      </div>

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
            {filtered.length === 0 && (
              <div className="p-12 text-center text-sm text-gray-500">Nenhum pedido encontrado</div>
            )}
          </div>
        </div>

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

            {Object.keys(selected.data).length > 0 && (
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
            )}

            {/* Workflow */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Workflow</h4>
              <div className="flex flex-wrap gap-1">
                {stateFlow.map((state) => (
                  <button
                    key={state}
                    onClick={() => handleStateChange(selected.id, state)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      selected.state === state
                        ? `${stateConfig[state].bg} ${stateConfig[state].color} font-semibold`
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {stateConfig[state].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 space-y-2">
              <button
                onClick={() => handleStateChange(selected.id, selected.state === 'COMPLETED' ? 'NEW' : 'COMPLETED')}
                className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                {selected.state === 'COMPLETED' ? 'Reabrir' : 'Marcar como Concluído'}
              </button>
              <button
                onClick={() => handleStateChange(selected.id, 'CANCELLED')}
                className="w-full px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Cancelar Pedido
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo Pedido" description="Criar manualmente um pedido de serviço">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Cliente *</label>
            <select
              value={createForm.customerId}
              onChange={(e) => setCreateForm({ ...createForm, customerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Selecionar cliente...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Serviço *</label>
            <select
              value={createForm.serviceId}
              onChange={(e) => setCreateForm({ ...createForm, serviceId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Selecionar serviço...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Problema *</label>
            <textarea
              value={createForm.problem}
              onChange={(e) => setCreateForm({ ...createForm, problem: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Descreva o problema..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Morada</label>
            <input
              type="text"
              value={createForm.address}
              onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Morada do serviço"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Urgência</label>
            <select
              value={createForm.urgency}
              onChange={(e) => setCreateForm({ ...createForm, urgency: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="LOW">Baixa</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleCreate}
              disabled={!createForm.customerId || !createForm.serviceId || !createForm.problem}
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              Criar Pedido
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
