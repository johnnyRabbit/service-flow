import { 
  MessageSquare, ClipboardList, Bot, UserCheck, Calendar, 
  TrendingUp, Clock, Star, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { mockMetrics, mockRequests, mockConversations } from '../data/mockData';

const weeklyData = [
  { day: 'Seg', conversations: 8, requests: 5 },
  { day: 'Ter', conversations: 12, requests: 7 },
  { day: 'Qua', conversations: 9, requests: 6 },
  { day: 'Qui', conversations: 15, requests: 10 },
  { day: 'Sex', conversations: 11, requests: 8 },
  { day: 'Sáb', conversations: 6, requests: 3 },
  { day: 'Dom', conversations: 2, requests: 1 },
];

const hourlyData = [
  { hour: '8h', msgs: 3 }, { hour: '9h', msgs: 8 }, { hour: '10h', msgs: 12 },
  { hour: '11h', msgs: 9 }, { hour: '12h', msgs: 5 }, { hour: '13h', msgs: 4 },
  { hour: '14h', msgs: 11 }, { hour: '15h', msgs: 7 }, { hour: '16h', msgs: 9 },
  { hour: '17h', msgs: 6 }, { hour: '18h', msgs: 3 },
];

export function Dashboard() {
  const metrics = mockMetrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Visão geral da sua operação</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white">
            <option>Últimos 7 dias</option>
            <option>Últimos 30 dias</option>
            <option>Este mês</option>
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={MessageSquare}
          label="Conversas Ativas"
          value={metrics.activeConversations}
          total={`de ${metrics.totalConversations} totais`}
          trend={12}
          color="blue"
        />
        <MetricCard
          icon={ClipboardList}
          label="Pedidos"
          value={metrics.totalRequests}
          total={`${metrics.requestsByAI} pela IA`}
          trend={8}
          color="green"
        />
        <MetricCard
          icon={Calendar}
          label="Marcações Hoje"
          value={metrics.appointmentsToday}
          total="2 confirmadas"
          trend={0}
          color="purple"
        />
        <MetricCard
          icon={Clock}
          label="Tempo Poupadо"
          value={`${metrics.estimatedTimeSaved}h`}
          total="esta semana"
          trend={23}
          color="orange"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-medium text-gray-500">Pedidos IA</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.requestsByAI}</p>
          <p className="text-xs text-green-600 mt-1">78% do total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-4 h-4 text-warning-500" />
            <span className="text-xs font-medium text-gray-500">Human Handoffs</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.humanHandoffs}</p>
          <p className="text-xs text-gray-500 mt-1">21% necessitaram humano</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-gray-500">Leads</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.leads}</p>
          <p className="text-xs text-green-600 mt-1">+3 vs semana anterior</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-medium text-gray-500">Satisfação</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.customerSatisfaction}/5</p>
          <p className="text-xs text-green-600 mt-1">+0.2 vs mês anterior</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Conversas & Pedidos (7 dias)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Area type="monotone" dataKey="conversations" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} />
              <Area type="monotone" dataKey="requests" stroke="#22c55e" fill="#dcfce7" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Mensagens por Hora (Hoje)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="msgs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Pedidos Recentes</h3>
            <a href="/requests" className="text-xs text-primary-600 hover:underline">Ver todos</a>
          </div>
          <div className="space-y-3">
            {mockRequests.slice(0, 4).map((req) => (
              <div key={req.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${
                  req.state === 'NEW' ? 'bg-blue-500' :
                  req.state === 'REVIEWING' ? 'bg-yellow-500' :
                  req.state === 'SCHEDULED' ? 'bg-green-500' :
                  req.state === 'QUOTED' ? 'bg-purple-500' : 'bg-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{req.customer.name}</p>
                  <p className="text-xs text-gray-500 truncate">{req.service.name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  req.state === 'NEW' ? 'bg-blue-100 text-blue-700' :
                  req.state === 'REVIEWING' ? 'bg-yellow-100 text-yellow-700' :
                  req.state === 'SCHEDULED' ? 'bg-green-100 text-green-700' :
                  req.state === 'QUOTED' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {req.state === 'NEW' ? 'Novo' : req.state === 'REVIEWING' ? 'A rever' : req.state === 'SCHEDULED' ? 'Agendado' : req.state === 'QUOTED' ? 'Orçamentado' : req.state}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Conversas Ativas</h3>
            <a href="/inbox" className="text-xs text-primary-600 hover:underline">Ver todas</a>
          </div>
          <div className="space-y-3">
            {mockConversations.filter(c => c.state !== 'CLOSED').slice(0, 4).map((conv) => (
              <div key={conv.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  conv.state === 'AI_ACTIVE' ? 'bg-primary-100 text-primary-700' :
                  conv.state === 'NEEDS_HUMAN' ? 'bg-red-100 text-red-700' :
                  conv.state === 'HUMAN_ACTIVE' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {conv.customer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{conv.customer.name}</p>
                  <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
                <div className="text-right">
                  {conv.unreadCount > 0 && (
                    <span className="bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, total, trend, color }: {
  icon: any;
  label: string;
  value: string | number;
  total: string;
  trend: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        {trend > 0 && (
          <div className="flex items-center gap-1 text-green-600">
            <ArrowUpRight className="w-3 h-3" />
            <span className="text-xs font-medium">{trend}%</span>
          </div>
        )}
        {trend < 0 && (
          <div className="flex items-center gap-1 text-red-600">
            <ArrowDownRight className="w-3 h-3" />
            <span className="text-xs font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{total}</p>
    </div>
  );
}
