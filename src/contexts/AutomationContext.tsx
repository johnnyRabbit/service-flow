import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface AutomationExecution {
  id: string;
  automationId: string;
  automationName: string;
  trigger: string;
  executedAt: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  duration: number;
  result?: string;
  error?: string;
}

interface AutomationContextType {
  executions: AutomationExecution[];
  addExecution: (execution: Omit<AutomationExecution, 'id' | 'executedAt'>) => void;
  clearExecutions: () => void;
  totalExecutions: number;
  successRate: number;
  avgDuration: number;
}

const AutomationContext = createContext<AutomationContextType | null>(null);

export function AutomationProvider({ children }: { children: ReactNode }) {
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);

  const addExecution = useCallback((execution: Omit<AutomationExecution, 'id' | 'executedAt'>) => {
    const newExecution: AutomationExecution = {
      ...execution,
      id: Math.random().toString(36).slice(2),
      executedAt: new Date().toISOString(),
    };
    setExecutions(prev => [newExecution, ...prev].slice(0, 100));
  }, []);

  const clearExecutions = useCallback(() => {
    setExecutions([]);
  }, []);

  const totalExecutions = executions.length;
  const successRate = executions.length > 0
    ? (executions.filter(e => e.status === 'SUCCESS').length / executions.length) * 100
    : 0;
  const avgDuration = executions.length > 0
    ? executions.reduce((sum, e) => sum + e.duration, 0) / executions.length
    : 0;

  return (
    <AutomationContext.Provider value={{
      executions,
      addExecution,
      clearExecutions,
      totalExecutions,
      successRate,
      avgDuration,
    }}>
      {children}
    </AutomationContext.Provider>
  );
}

export function useAutomation() {
  const ctx = useContext(AutomationContext);
  if (!ctx) throw new Error('useAutomation must be used within AutomationProvider');
  return ctx;
}
