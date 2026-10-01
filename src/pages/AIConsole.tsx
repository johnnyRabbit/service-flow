import { useAI } from '../contexts/AIContext';
import { Activity, Zap, Clock, Target, AlertTriangle, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';

export function AIConsole() {
  const { metrics, totalCalls, avgProcessingTime, avgConfidence, toolCallsCount, humanHandoffs, clearMetrics } = useAI();

  const intentCounts = metrics.reduce((acc, m) => {
    const intent = m.response.intent.intent;
    acc[intent] = (acc[intent] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Console</h1>
          <p className="text-sm text-gray-500 mt-1">Monitorização em tempo real do motor de IA</p>
        </div>
        <button
          onClick={clearMetrics}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Limpar Métricas
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-medium text-gray-500">Total Chamadas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalCalls}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-500">Tempo Médio</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{Math.round(avgProcessingTime)}ms</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-gray-500">Confiança Média</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{Math.round(avgConfidence * 100)}%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-medium text-gray-500">Tool Calls</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{toolCallsCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-gray-500">Handoffs</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{humanHandoffs}</p>
        </div>
      </div>

      {/* Intent Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-500" />
          Distribuição de Intenções
        </h3>
        {Object.keys(intentCounts).length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">Sem dados ainda. Envie mensagens na Inbox para ver métricas.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(intentCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([intent, count]) => {
                const percentage = (count / totalCalls) * 100;
                return (
                  <div key={intent}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{intent}</span>
                      <span className="text-gray-500">{count} ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Recent Calls Log */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          Logs Recentes
        </h3>
        {metrics.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">Sem logs ainda</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {metrics.map((metric) => (
              <div key={metric.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{metric.customerName}</span>
                      {metric.response.intent.requiresHuman && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                          Handoff
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(metric.timestamp).toLocaleString('pt-PT')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{metric.response.totalProcessingTime}ms</p>
                    <p className="text-xs text-gray-500">{metric.response.tokensUsed} tokens</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Input</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded p-2 line-clamp-2">
                      {metric.inputMessage}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Output</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded p-2 line-clamp-2">
                      {metric.response.intent.suggestedReply}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-green-500" />
                    <span className="text-gray-600">
                      {metric.response.intent.intent} ({Math.round(metric.response.intent.confidence * 100)}%)
                    </span>
                  </div>
                  {metric.response.toolCalls && metric.response.toolCalls.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span className="text-gray-600">
                        {metric.response.toolCalls.length} tool(s)
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Model: {metric.response.model}</span>
                  </div>
                </div>

                {/* Tool Calls Detail */}
                {metric.response.toolCalls && metric.response.toolCalls.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-700 mb-2">Tool Calls:</p>
                    <div className="space-y-2">
                      {metric.response.toolCalls.map((tool, idx) => (
                        <div key={idx} className="bg-gray-50 rounded p-2 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">{tool.toolName}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">{tool.executionTime}ms</span>
                              {tool.success ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 text-red-500" />
                              )}
                            </div>
                          </div>
                          <div className="text-gray-600">
                            <span className="font-medium">Params:</span>{' '}
                            <code className="bg-white px-1 rounded">
                              {JSON.stringify(tool.parameters)}
                            </code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
