import { useState, useMemo } from 'react';
import { MessageSquare, ClipboardList, Calendar, Users, Clock, Zap, UserCheck, TrendingUp } from 'lucide-react';
import { useDashboardMetrics, DateRange } from '../hooks/useDashboardMetrics';
import { KPICard } from '../components/ui/KPICard';
import { TrendChart } from '../components/ui/TrendChart';
import { StateDistribution } from '../components/ui/StateDistribution';
import { AlertBanner, Alert } from '../components/ui/AlertBanner';

export function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const metrics = useDashboardMetrics(dateRange);

  // Generate intelligent alerts based on metrics
  const alerts = useMemo(() => {
    const alertList: Alert[] = [];
    const now = new Date().toISOString();

    // High handoff rate alert
    if (metrics.handoffRate > 30) {
      alertList.push({
        id: 'high-handoff',
        type: 'warning',
        title: 'Taxa de Handoff Elevada',
        message: `${metrics.handoffRate.toFixed(1)}% das conversas requerem intervenção humana. Considere ajustar o nível de autonomia da IA.`,
        timestamp: now,
      });
    }

    // Low AI resolution rate
    if (metrics.aiResolutionRate < 50 && metrics.totalConversations > 10) {
      alertList.push({
        id: 'low-ai-resolution',
        type: 'info',
        title: 'Oportunidade de Melhoria',
        message: `Apenas ${metrics.aiResolutionRate.toFixed(1)}% das conversas são resolvidas automaticamente pela IA.`,
        timestamp: now,
      });
    }

    // High no-show rate
    if (metrics.noShowRate > 20) {
      alertList.push({
        id: 'high-noshow',
        type: 'error',
        title: 'Taxa de Não Comparência Alta',
        message: `${metrics.noShowRate.toFixed(1)}% das marcações resultam em não comparência. Considere enviar lembretes automáticos.`,
        timestamp: now,
      });
    }

    // Positive trend alert
    if (metrics.conversationTrend > 20) {
      alertList.push({
        id: 'positive-trend',
        type: 'success',
        title: 'Crescimento Positivo',
        message: `As conversas aumentaram ${metrics.conversationTrend.toFixed(1)}% em relação ao período anterior.`,
        timestamp: now,
      });
    }

    return alertList.filter(a => !dismissedAlerts.includes(a.id));
  }, [metrics, dismissedAlerts]);

  const handleDismissAlert = (id: string) => {
    setDismissedAlerts([...dismissedAlerts, id]);
  };

  const handleExport = () => {
    const csv = [
      ['Métrica', 'Valor'],
      ['Total de Conversas', metrics.totalConversations],
      ['Conversas Ativas', metrics.activeConversations],
      ['Conversas por IA', metrics.conversationsByAI],
      ['Conversas por Humano', metrics.conversationsByHuman],
      ['Taxa de Resolução IA', `${metrics.aiResolutionRate.toFixed(1)}%`],
      ['Total de Pedidos', metrics.totalRequests],
      ['Handoffs para Humano', metrics.humanHandoffs],
      ['Taxa de Handoff', `${metrics.handoffRate.toFixed(1)}%`],
      ['Total de Marcações', metrics.totalAppointments],
      ['Marcações Confirmadas', metrics.confirmedAppointments],
      ['Taxa de Não Comparência', `${metrics.noShowRate.toFixed(1)}%`],
      ['Total de Clientes', metrics.totalCustomers],
      ['Novos Clientes', metrics.newCustomers],
      ['Tempo Estimado Poupadо', `${metrics.estimatedTimeSaved.toFixed(1)}h`],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <AlertBanner alerts={alerts} onDismiss={handleDismissAlert} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Métricas em tempo real da sua operação</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="this_month">Este mês</option>
            <option value="last_month">Mês passado</option>
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Conversas Totais"
          value={metrics.totalConversations}
          trend={metrics.conversationTrend}
          icon={<MessageSquare className="w-5 h-5" />}
          color="blue"
          subtitle={`${metrics.activeConversations} ativas`}
        />
        <KPICard
          title="Pedidos"
          value={metrics.totalRequests}
          trend={metrics.requestTrend}
          icon={<ClipboardList className="w-5 h-5" />}
          color="green"
          subtitle={`${metrics.requestsByAI} pela IA`}
        />
        <KPICard
          title="Marcações"
          value={metrics.totalAppointments}
          icon={<Calendar className="w-5 h-5" />}
          color="purple"
          subtitle={`${metrics.confirmedAppointments} confirmadas`}
        />
        <KPICard
          title="Clientes"
          value={metrics.totalCustomers}
          trend={metrics.customerTrend}
          icon={<Users className="w-5 h-5" />}
          color="orange"
          subtitle={`${metrics.newCustomers} novos`}
        />
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Taxa de Resolução IA"
          value={`${metrics.aiResolutionRate.toFixed(1)}%`}
          icon={<Zap className="w-5 h-5" />}
          color="indigo"
          subtitle={`${metrics.conversationsByAI} conversas`}
        />
        <KPICard
          title="Handoffs"
          value={metrics.humanHandoffs}
          trend={-metrics.handoffRate}
          icon={<UserCheck className="w-5 h-5" />}
          color="red"
          subtitle={`${metrics.handoffRate.toFixed(1)}% do total`}
        />
        <KPICard
          title="Tempo Poupadо"
          value={`${metrics.estimatedTimeSaved.toFixed(1)}h`}
          icon={<Clock className="w-5 h-5" />}
          color="green"
          subtitle="estimado pela IA"
        />
        <KPICard
          title="Taxa Não Comparência"
          value={`${metrics.noShowRate.toFixed(1)}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="orange"
          subtitle={`${metrics.totalAppointments - metrics.completedAppointments - metrics.confirmedAppointments} marcações`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          days={dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 30}
          title="Conversas por Dia"
          dataKey="conversations"
        />
        <TrendChart
          days={dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 30}
          title="Pedidos por Dia"
          dataKey="requests"
        />
      </div>

      {/* State Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StateDistribution
          data={metrics.requestsByState}
          title="Distribuição de Pedidos por Estado"
        />
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Resumo de Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Resolução Automática (IA)</span>
                <span className="text-sm font-semibold text-gray-900">{metrics.aiResolutionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${metrics.aiResolutionRate}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Taxa de Confirmação</span>
                <span className="text-sm font-semibold text-gray-900">
                  {metrics.totalAppointments > 0 
                    ? ((metrics.confirmedAppointments / metrics.totalAppointments) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${metrics.totalAppointments > 0 ? (metrics.confirmedAppointments / metrics.totalAppointments) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Tempo Médio de Resposta</span>
                <span className="text-sm font-semibold text-gray-900">{metrics.avgResponseTime} min</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((metrics.avgResponseTime / 60) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Satisfação do Cliente</span>
                <span className="text-sm font-semibold text-gray-900">4.7/5.0</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: '94%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
