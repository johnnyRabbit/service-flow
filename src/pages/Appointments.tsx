import { useState } from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';

const stateConfig: Record<string, { label: string; color: string; icon: any }> = {
  SCHEDULED: { label: 'Agendada', color: 'bg-blue-100 text-blue-700', icon: Calendar },
  CONFIRMED: { label: 'Confirmada', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  IN_PROGRESS: { label: 'Em curso', color: 'bg-indigo-100 text-indigo-700', icon: Clock },
  COMPLETED: { label: 'Concluída', color: 'bg-gray-100 text-gray-700', icon: CheckCircle },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-700', icon: XCircle },
  NO_SHOW: { label: 'Não compareceu', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
};

export function Appointments() {
  const { appointments, customers, services, createAppointment } = useData();
  const { addToast } = useToast();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    customerId: '',
    serviceId: '',
    date: '',
    time: '',
    duration: 60,
    notes: '',
  });

  const today = '2024-12-20';
  const tomorrow = '2024-12-21';

  const todayAppts = appointments.filter(a => a.date === today);
  const tomorrowAppts = appointments.filter(a => a.date === tomorrow);

  const handleCreate = () => {
    if (!form.customerId || !form.serviceId || !form.date || !form.time) {
      addToast({ type: 'error', title: 'Preencha todos os campos obrigatórios' });
      return;
    }

    createAppointment({
      customerId: form.customerId,
      serviceId: form.serviceId,
      date: form.date,
      time: form.time,
      duration: form.duration,
      state: 'SCHEDULED',
      notes: form.notes,
    });

    setShowCreate(false);
    setForm({ customerId: '', serviceId: '', date: '', time: '', duration: 60, notes: '' });
    addToast({ type: 'success', title: 'Marcação criada', message: 'Confirmação será enviada ao cliente' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marcações</h1>
          <p className="text-sm text-gray-500 mt-1">Calendário de serviços e visitas</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}
            >
              Lista
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}
            >
              Calendário
            </button>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Marcação
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Hoje</p>
          <p className="text-2xl font-bold text-gray-900">{todayAppts.length}</p>
          <p className="text-xs text-green-600">{todayAppts.filter(a => a.state === 'CONFIRMED').length} confirmadas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Amanhã</p>
          <p className="text-2xl font-bold text-gray-900">{tomorrowAppts.length}</p>
          <p className="text-xs text-gray-500">{tomorrowAppts.filter(a => a.state === 'SCHEDULED').length} pendentes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Esta Semana</p>
          <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
          <p className="text-xs text-gray-500">marcações totais</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Taxa Confirmação</p>
          <p className="text-2xl font-bold text-gray-900">87%</p>
          <p className="text-xs text-green-600">+5% vs semana anterior</p>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="bg-gray-50 p-2 text-center">
                <span className="text-xs font-medium text-gray-500">{day}</span>
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const dayNum = i - 2;
              const dateStr = `2024-12-${String(dayNum).padStart(2, '0')}`;
              const dayAppts = appointments.filter(a => a.date === dateStr);
              const isCurrentMonth = dayNum >= 1 && dayNum <= 31;
              const isToday = dateStr === today;
              
              return (
                <div key={i} className={`bg-white p-2 min-h-[80px] ${!isCurrentMonth ? 'opacity-40' : ''} ${isToday ? 'bg-primary-50' : ''}`}>
                  {isCurrentMonth && (
                    <>
                      <span className={`text-xs font-medium ${isToday ? 'text-primary-700' : 'text-gray-700'}`}>
                        {dayNum}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayAppts.map(apt => (
                          <div key={apt.id} className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded truncate">
                            {apt.time} {apt.customer.name.split(' ')[0]}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              Hoje — 20 Dezembro
            </h3>
            <div className="space-y-3">
              {todayAppts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Sem marcações para hoje</p>
              ) : (
                todayAppts.map((apt) => {
                  const config = stateConfig[apt.state];
                  const Icon = config.icon;
                  return (
                    <div key={apt.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-lg font-bold text-gray-900">{apt.time}</p>
                        <p className="text-xs text-gray-500">{apt.duration}min</p>
                      </div>
                      <div className="w-px h-12 bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{apt.customer.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${config.color}`}>
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{apt.service.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{apt.customer.address?.split(',')[0]}</span>
                          {apt.assignedUser && (
                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{apt.assignedUser.name}</span>
                          )}
                        </div>
                        {apt.notes && <p className="text-xs text-gray-400 mt-1 italic">{apt.notes}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
                          Confirmar
                        </button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
                          Reagendar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Amanhã — 21 Dezembro
            </h3>
            <div className="space-y-3">
              {tomorrowAppts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Sem marcações para amanhã</p>
              ) : (
                tomorrowAppts.map((apt) => {
                  const config = stateConfig[apt.state];
                  const Icon = config.icon;
                  return (
                    <div key={apt.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-lg font-bold text-gray-900">{apt.time}</p>
                        <p className="text-xs text-gray-500">{apt.duration}min</p>
                      </div>
                      <div className="w-px h-12 bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{apt.customer.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${config.color}`}>
                            <Icon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{apt.service.name}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nova Marcação" description="Agendar um serviço para um cliente">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Cliente *</label>
            <select
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
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
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Selecionar serviço...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Data *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Hora *</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Duração (min)</label>
            <input
              type="number"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Notas</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Notas adicionais..."
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleCreate}
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              Criar Marcação
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
