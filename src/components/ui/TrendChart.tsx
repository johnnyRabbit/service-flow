import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useData } from '../../contexts/DataContext';

interface TrendChartProps {
  days: number;
  title: string;
  dataKey: 'conversations' | 'requests' | 'appointments';
}

export function TrendChart({ days, title, dataKey }: TrendChartProps) {
  const { conversations, requests, appointments } = useData();

  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      let count = 0;
      
      if (dataKey === 'conversations') {
        count = conversations.filter((c: any) => {
          const msgDate = new Date(c.lastMessageAt);
          return msgDate.toISOString().split('T')[0] === dateStr;
        }).length;
      } else if (dataKey === 'requests') {
        count = requests.filter((r: any) => {
          const createdDate = new Date(r.createdAt);
          return createdDate.toISOString().split('T')[0] === dateStr;
        }).length;
      } else if (dataKey === 'appointments') {
        count = appointments.filter((a: any) => a.date === dateStr).length;
      }
      
      data.push({
        date: dateStr,
        label: date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }),
        value: count,
      });
    }
    
    return data;
  }, [conversations, requests, appointments, days, dataKey]);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);
  const avg = total / days;
  const max = Math.max(...chartData.map(d => d.value));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Total: <span className="font-medium text-gray-700">{total}</span> • 
            Média: <span className="font-medium text-gray-700">{avg.toFixed(1)}/dia</span> • 
            Máx: <span className="font-medium text-gray-700">{max}</span>
          </p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 12 }} 
            stroke="#94a3b8"
            interval={Math.floor(days / 7)}
          />
          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
