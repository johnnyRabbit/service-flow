import { useState } from 'react';
import { Zap, Plus, Play, Pause, Edit, Trash2, Clock, ArrowRight, MessageSquare, Mail, Bell, UserCheck, ClipboardList } from 'lucide-react';

const mockAutomations = [
  {
    id: 'auto_1',
    name: 'Follow-up após orçamento',
    trigger: 'QUOTE_SENT',
    conditions: ['Sem resposta do cliente'],
    actions: ['SEND_MESSAGE'],
    delay: 48,
    delayUnit: 'HOURS',
    enabled: true,
    description: 'Quando um orçamento é enviado, aguardar 48h. Se o cliente não responder, enviar mensagem de follow-up.',
  },
  {
    id: 'auto_2',
    name: 'Lembrete de marcação',
    trigger: 'APPOINTMENT_CREATED',
    conditions: ['24h antes da marcação'],
    actions: ['SEND_MESSAGE', 'SEND_EMAIL'],
    delay: 24,
    delayUnit: 'HOURS',
    enabled: true,
    description: 'Enviar lembrete ao cliente 24h antes da marcação agendada.',
  },
  {
    id: 'auto_3',
    name: 'Conversa inativa',
    trigger: 'CONVERSATION_IDLE',
    conditions: ['Sem mensagens há 2h', 'Estado: WAITING_CUSTOMER'],
    actions: ['SEND_MESSAGE'],
    delay: 2,
    delayUnit: 'HOURS',
    enabled: true,
    description: 'Se o cliente não responder há 2h, enviar mensagem de follow-up automática.',
  },
  {
    id: 'auto_4',
    name: 'Notificar equipa - pedido urgente',
    trigger: 'REQUEST_CREATED',
    conditions: ['Urgência: HIGH ou URGENT'],
    actions: ['NOTIFY_USER'],
    delay: 0,
    delayUnit: 'MINUTES',
    enabled: true,
    description: 'Notificar imediatamente a equipa quando um pedido urgente é criado.',
  },
  {
    id: 'auto_5',
    name: 'Pedido concluído - pedido de avaliação',
    trigger: 'REQUEST_UPDATED',
    conditions: ['Estado mudou para COMPLETED'],
    actions: ['SEND_MESSAGE'],
    delay: 1,
    delayUnit: 'HOURS',
    enabled: false,
    description: 'Após conclusão do serviço, enviar pedido de avaliação ao cliente.',
  },
];

const triggerLabels: Record<string, string> = {
  REQUEST_CREATED: 'Pedido Criado',
  REQUEST_UPDATED: 'Pedido Atualizado',
  QUOTE_SENT: 'Orçamento Enviado',
  APPOINTMENT_CREATED: 'Marcação Criada',
  APPOINTMENT_REMINDER: 'Lembrete de Marcação',
  CONVERSATION_IDLE: 'Conversa Inativa',
};

const actionIcons: Record<string, any> = {
  SEND_MESSAGE: MessageSquare,
  SEND_EMAIL: Mail,
  NOTIFY_USER: Bell,
  REQUEST_HUMAN: UserCheck,
  UPDATE_REQUEST: ClipboardList,
};

export function Automations() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automações</h1>
          <p className="text-sm text-gray-500 mt-1">Regras de automação: Trigger → Condition → Action</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Regra
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Regras Ativas</p>
          <p className="text-2xl font-bold text-gray-900">{mockAutomations.filter(a => a.enabled).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Execuções Hoje</p>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Tempo Poupadо</p>
          <p className="text-2xl font-bold text-gray-900">3.2h</p>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Criar Nova Regra</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Nome</label>
              <input type="text" placeholder="Nome da automação" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Trigger</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>REQUEST_CREATED</option>
                <option>REQUEST_UPDATED</option>
                <option>QUOTE_SENT</option>
                <option>APPOINTMENT_CREATED</option>
                <option>CONVERSATION_IDLE</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Delay</label>
              <div className="flex gap-2">
                <input type="number" placeholder="0" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option>MINUTES</option>
                  <option>HOURS</option>
                  <option>DAYS</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Criar</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
          </div>
        </div>
      )}

      {/* Automation Rules */}
      <div className="space-y-3">
        {mockAutomations.map((auto) => (
          <div key={auto.id} className={`bg-white rounded-xl border border-gray-200 p-5 ${!auto.enabled ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${auto.enabled ? 'bg-primary-50' : 'bg-gray-100'}`}>
                  <Zap className={`w-4 h-4 ${auto.enabled ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{auto.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{auto.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className={`p-1.5 rounded-lg ${auto.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {auto.enabled ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
                <button className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:text-gray-600">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Flow */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <Zap className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">{triggerLabels[auto.trigger]}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300" />
              {auto.conditions.map((cond, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Clock className="w-3 h-3 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-700">{cond}</span>
                </div>
              ))}
              {auto.delay > 0 && (
                <>
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">Aguardar {auto.delay}{auto.delayUnit === 'HOURS' ? 'h' : auto.delayUnit === 'DAYS' ? 'd' : 'min'}</span>
                  </div>
                </>
              )}
              <ArrowRight className="w-4 h-4 text-gray-300" />
              {auto.actions.map((action, i) => {
                const ActionIcon = actionIcons[action] || Zap;
                return (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                    <ActionIcon className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-medium text-green-700">{action.replace(/_/g, ' ')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
