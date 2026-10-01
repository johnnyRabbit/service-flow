import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Conversation } from '../types';

export type AutonomyLevel = 1 | 2 | 3;

export interface HandoffRequest {
  id: string;
  conversationId: string;
  customerName: string;
  reason: string;
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  requestedAt: string;
  assignedTo?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESOLVED';
  aiSummary: string;
}

interface HandoffContextType {
  autonomyLevel: AutonomyLevel;
  setAutonomyLevel: (level: AutonomyLevel) => void;
  handoffQueue: HandoffRequest[];
  requestHandoff: (conversationId: string, customerName: string, reason: string, urgency: HandoffRequest['urgency'], aiSummary: string) => void;
  acceptHandoff: (id: string, agentName: string) => void;
  rejectHandoff: (id: string) => void;
  resolveHandoff: (id: string) => void;
  pendingCount: number;
  criticalCount: number;
}

const HandoffContext = createContext<HandoffContextType | null>(null);

export function HandoffProvider({ children }: { children: ReactNode }) {
  const [autonomyLevel, setAutonomyLevel] = useState<AutonomyLevel>(2);
  const [handoffQueue, setHandoffQueue] = useState<HandoffRequest[]>([]);

  const requestHandoff = useCallback((
    conversationId: string,
    customerName: string,
    reason: string,
    urgency: HandoffRequest['urgency'],
    aiSummary: string
  ) => {
    const request: HandoffRequest = {
      id: Math.random().toString(36).slice(2),
      conversationId,
      customerName,
      reason,
      urgency,
      requestedAt: new Date().toISOString(),
      status: 'PENDING',
      aiSummary,
    };
    setHandoffQueue(prev => [request, ...prev]);
  }, []);

  const acceptHandoff = useCallback((id: string, agentName: string) => {
    setHandoffQueue(prev => prev.map(h => 
      h.id === id ? { ...h, status: 'ACCEPTED' as const, assignedTo: agentName } : h
    ));
  }, []);

  const rejectHandoff = useCallback((id: string) => {
    setHandoffQueue(prev => prev.map(h => 
      h.id === id ? { ...h, status: 'REJECTED' as const } : h
    ));
  }, []);

  const resolveHandoff = useCallback((id: string) => {
    setHandoffQueue(prev => prev.map(h => 
      h.id === id ? { ...h, status: 'RESOLVED' as const } : h
    ));
  }, []);

  const pendingCount = handoffQueue.filter(h => h.status === 'PENDING').length;
  const criticalCount = handoffQueue.filter(h => h.status === 'PENDING' && h.urgency === 'CRITICAL').length;

  return (
    <HandoffContext.Provider value={{
      autonomyLevel,
      setAutonomyLevel,
      handoffQueue,
      requestHandoff,
      acceptHandoff,
      rejectHandoff,
      resolveHandoff,
      pendingCount,
      criticalCount,
    }}>
      {children}
    </HandoffContext.Provider>
  );
}

export function useHandoff() {
  const ctx = useContext(HandoffContext);
  if (!ctx) throw new Error('useHandoff must be used within HandoffProvider');
  return ctx;
}
