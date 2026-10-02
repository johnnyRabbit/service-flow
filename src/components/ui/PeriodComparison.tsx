import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PeriodComparisonProps {
  label: string;
  currentValue: number;
  previousValue: number;
  format?: 'number' | 'percentage' | 'currency' | 'time';
  suffix?: string;
}

export function PeriodComparison({ 
  label, 
  currentValue, 
  previousValue, 
  format = 'number',
  suffix = ''
}: PeriodComparisonProps) {
  const change = previousValue === 0 ? 0 : ((currentValue - previousValue) / previousValue) * 100;
  const absoluteChange = currentValue - previousValue;

  const formatValue = (value: number) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `€${value.toFixed(2)}`;
      case 'time':
        return `${value.toFixed(1)}h`;
      default:
        return value.toString();
    }
  };

  const getTrendIcon = () => {
    if (change === 0) return <Minus className="w-4 h-4 text-gray-400" />;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getTrendColor = () => {
    if (change === 0) return 'text-gray-500';
    if (change > 0) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">{label}</h3>
        {getTrendIcon()}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">
            {formatValue(currentValue)}{suffix}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Período anterior</span>
          <span className="text-gray-700 font-medium">
            {formatValue(previousValue)}{suffix}
          </span>
        </div>
        
        <div className={`flex items-center justify-between text-sm font-semibold ${getTrendColor()}`}>
          <span>Variação</span>
          <span>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
            {absoluteChange !== 0 && (
              <span className="text-xs font-normal text-gray-500 ml-1">
                ({absoluteChange > 0 ? '+' : ''}{formatValue(absoluteChange)}{suffix})
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
