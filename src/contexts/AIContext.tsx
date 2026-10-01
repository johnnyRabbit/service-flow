import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AIResponse, ToolCall } from '../lib/ai-schemas';

interface AIMetric {
  id: string;
  timestamp: string;
  conversationId: string;
  customerName: string;
  inputMessage: string;
  response: AIResponse;
  status: 'success' | 'error';
}

interface AIContextType {
  metrics: AIMetric[];
  addMetric: (metric: Omit<AIMetric, 'id' | 'timestamp'>) => void;
  clearMetrics: () => void;
  totalCalls: number;
  avgProcessingTime: number;
  avgConfidence: number;
  toolCallsCount: number;
  humanHandoffs: number;
}

const AIContext = createContext<AIContextType | null>(null);

export function AIProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<AIMetric[]>([]);

  const addMetric = useCallback((metric: Omit<AIMetric, 'id' | 'timestamp'>) => {
    const newMetric: AIMetric = {
      ...metric,
      id: Math.random().toString(36).slice(2),
      timestamp: new Date().toISOString(),
    };
    setMetrics(prev => [newMetric, ...prev].slice(0, 100)); // Keep last 100
  }, []);

  const clearMetrics = useCallback(() => {
    setMetrics([]);
  }, []);

  const totalCalls = metrics.length;
  const avgProcessingTime = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.response.totalProcessingTime, 0) / metrics.length
    : 0;
  const avgConfidence = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.response.intent.confidence, 0) / metrics.length
    : 0;
  const toolCallsCount = metrics.reduce((sum, m) => sum + (m.response.toolCalls?.length || 0), 0);
  const humanHandoffs = metrics.filter(m => m.response.intent.requiresHuman).length;

  return (
    <AIContext.Provider value={{
      metrics,
      addMetric,
      clearMetrics,
      totalCalls,
      avgProcessingTime,
      avgConfidence,
      toolCallsCount,
      humanHandoffs,
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be used within AIProvider');
  return ctx;
}
