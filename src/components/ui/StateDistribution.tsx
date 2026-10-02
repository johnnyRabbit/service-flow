import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StateDistributionProps {
  data: Record<string, number>;
  title: string;
}

const STATE_COLORS: Record<string, string> = {
  NEW: '#3b82f6',
  REVIEWING: '#f59e0b',
  QUOTE_PENDING: '#f97316',
  QUOTED: '#8b5cf6',
  SCHEDULED: '#10b981',
  IN_PROGRESS: '#6366f1',
  COMPLETED: '#6b7280',
  CANCELLED: '#ef4444',
};

const STATE_LABELS: Record<string, string> = {
  NEW: 'Novo',
  REVIEWING: 'A rever',
  QUOTE_PENDING: 'Orçamento pendente',
  QUOTED: 'Orçamentado',
  SCHEDULED: 'Agendado',
  IN_PROGRESS: 'Em progresso',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

export function StateDistribution({ data, title }: StateDistributionProps) {
  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([state, value]) => ({
      name: STATE_LABELS[state] || state,
      value,
      color: STATE_COLORS[state] || '#94a3b8',
    }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          Sem dados para mostrar
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500">Total: {total}</span>
      </div>
      
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number, name: string) => [
              `${value} (${((value / total) * 100).toFixed(1)}%)`,
              name
            ]}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value: string) => <span className="text-xs text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
