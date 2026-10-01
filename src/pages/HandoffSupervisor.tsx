import { useHandoff, AutonomyLevel } from '../contexts/HandoffContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, XCircle, Clock, Shield, Zap, Users, TrendingUp } from 'lucide-react';

const urgencyColors = {
  LOW: 'bg-gray-100 text-gray-700',
  NORMAL: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const statusIcons = {
  PENDING: Clock,
  ACCEPTED: CheckCircle,
  REJECTED: XCircle,
  RESOLVED: CheckCircle,
};

const statusColors = {
  PENDING: 'text-yellow-600',
  ACCEPTED: 'text-green-600',
  REJECTED: 'text-red-600',
  RESOLVED: 'text-blue-600',
};

export function HandoffSupervisor() {
  const { 
    autonomyLevel, 
    setAutonomyLevel, 
    handoffQueue, 
    acceptHandoff, 
    rejectHandoff, 
    resolveHandoff,
    pendingCount,
    criticalCount,
  } = useHandoff();
  const navigate = useNavigate();

  const pending = handoffQueue.filter(h => h.status === 'PENDING');
  const recent = handoffQueue.filter(h => h.status !== 'PENDING').slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Supervisão de Handoffs</h1>
        <p className="text-sm text-gray-500 mt-1">Gerir transferências IA → Humano</p>
      </div>

      {/* Autonomy Level Control */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-900">Nível de Autonomia da IA</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { level: 1 as AutonomyLevel, label: 'Nível 1', desc: 'Sugestão', color: 'border-gray-300 bg-gray-50' },
            { level: 2 as AutonomyLevel, label: 'Nível 2', desc: 'Semi-Autónomo', color: 'border-primary-500 bg-primary-50' },
            { level: 3 as AutonomyLevel, label: 'Nível 3', desc: 'Autónomo', color: 'border-green-500 bg-green-50' },
          ].map(({ level, label, desc, color }) => (
            <button
              key={level}
              onClick={() => setAutonomyLevel(level)}
              className={`p-4 rounded-lg border-2 transition-all ${
                autonomyLevel === level ? color : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <p className="font-semibold text-gray-900">{label}</p>
              <p className="text-xs text-gray-600 mt-1">{desc}</p>
              {autonomyLevel === level && (
                <p className="text-xs font-medium text-primary-700 mt-2">✓ Ativo</p>
              )}
            </button>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Nível {autonomyLevel}:</strong>{' '}
            {autonomyLevel === 1 && 'IA apenas sugere respostas. Humano aprova tudo.'}
            {autonomyLevel === 2 && 'IA responde FAQs e recolhe dados. Ações importantes exigem aprovação.'}
            {autonomyLevel === 3 && 'IA executa ações previamente autorizadas sem aprovação.'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-medium text-gray-500">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-gray-500">Críticos</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-gray-500">Resolvidos</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {handoffQueue.filter(h => h.status === 'RESOLVED').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-medium text-gray-500">Taxa Aceite</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {handoffQueue.length > 0 
              ? Math.round((handoffQueue.filter(h => h.status === 'ACCEPTED' || h.status === 'RESOLVED').length / handoffQueue.length) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Pending Handoffs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">Handoffs Pendentes</h3>
          {pendingCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              {pendingCount}
            </span>
          )}
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">Sem handoffs pendentes</p>
        ) : (
          <div className="space-y-3">
            {pending.map((handoff) => {
              const StatusIcon = statusIcons[handoff.status];
              return (
                <div key={handoff.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">{handoff.customerName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${urgencyColors[handoff.urgency]}`}>
                          {handoff.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(handoff.requestedAt).toLocaleString('pt-PT')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Motivo:</p>
                    <p className="text-sm text-gray-700">{handoff.reason}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Resumo da IA:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">{handoff.aiSummary}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        acceptHandoff(handoff.id, 'Você');
                        navigate(`/inbox/${handoff.conversationId}`);
                      }}
                      className="flex-1 px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aceitar e Assumir
                    </button>
                    <button
                      onClick={() => rejectHandoff(handoff.id)}
                      className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeitar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Handoffs */}
      {recent.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-gray-900">Handoffs Recentes</h3>
          </div>
          <div className="space-y-2">
            {recent.map((handoff) => {
              const StatusIcon = statusIcons[handoff.status];
              return (
                <div key={handoff.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <StatusIcon className={`w-5 h-5 ${statusColors[handoff.status]}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{handoff.customerName}</p>
                    <p className="text-xs text-gray-500">{handoff.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${statusColors[handoff.status]}`}>
                      {handoff.status}
                    </p>
                    {handoff.assignedTo && (
                      <p className="text-xs text-gray-500">por {handoff.assignedTo}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
