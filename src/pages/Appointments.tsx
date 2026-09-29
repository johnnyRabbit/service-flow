import { useState } from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { mockAppointments } from '../data/mockData';

const stateConfig: Record<string, { label: string; color: string; icon: any }> = {
  SCHEDULED: { label: 'Agendada', color: 'bg-blue-100 text-blue-700', icon: Calendar },
  CONFIRMED: { label: 'Confirmada', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  IN_PROGRESS: { label: 'Em curso', color: 'bg-indigo-100 text-indigo-700', icon: Clock },
  COMPLETED: { label: 'Concluída', color: 'bg-gray-100 text-gray-700', icon: CheckCircle },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-700', icon: XCircle },
  NO_SHOW: { label: 'Não compareceu', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
};

export function Appointments() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const today = '2024-12-20';
  const tomorrow = '2024-12-21';

  const todayAppts = mockAppointments.filter(a => a.date === today);
  const tomorrowAppts = mockAppointments.filter(a => a.date === tomorrow);

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            + Nova Marcação
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
          <p className="text-2xl font-bold text-gray-900">{mockAppointments.length}</p>
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
              const dayNum = i - 2; // offset for first day
              const dateStr = `2024-12-${String(dayNum).padStart(2, '0')}`;
              const dayAppts = mockAppointments.filter(a => a.date === dateStr);
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
          {/* Today */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
              Hoje — 20 Dezembro
            </h3>
            <div className="space-y-3">
              {todayAppts.map((apt) => {
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
              })}
            </div>
          </div>

          {/* Tomorrow */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Amanhã — 21 Dezembro
            </h3>
            <div className="space-y-3">
              {tomorrowAppts.map((apt) => {
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
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
