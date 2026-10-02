import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';

export type DateRange = '7d' | '30d' | '90d' | 'this_month' | 'last_month' | 'custom';

export interface DashboardMetrics {
  // Conversations
  totalConversations: number;
  activeConversations: number;
  conversationsByAI: number;
  conversationsByHuman: number;
  avgResponseTime: number; // minutes
  
  // Requests
  totalRequests: number;
  requestsByState: Record<string, number>;
  requestsByAI: number;
  avgRequestCompletionTime: number; // hours
  
  // Appointments
  totalAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  noShowRate: number; // percentage
  
  // Customers
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number; // had interaction in last 30 days
  
  // AI Performance
  aiResolutionRate: number; // percentage
  avgConfidence: number;
  humanHandoffs: number;
  handoffRate: number; // percentage
  
  // Time Saved
  estimatedTimeSaved: number; // hours
  avgTimePerRequest: number; // minutes (manual vs AI)
  
  // Trends
  conversationTrend: number; // percentage change
  requestTrend: number;
  customerTrend: number;
}

export function useDashboardMetrics(dateRange: DateRange, customStart?: string, customEnd?: string) {
  const { conversations, requests, appointments, customers } = useData();

  const metrics = useMemo(() => {
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;
    let previousStartDate: Date;
    let previousEndDate: Date;

    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousEndDate = startDate;
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousEndDate = startDate;
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousEndDate = startDate;
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEndDate = startDate;
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        previousEndDate = startDate;
        break;
      case 'custom':
        startDate = customStart ? new Date(customStart) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = customEnd ? new Date(customEnd) : now;
        previousStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
        previousEndDate = startDate;
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousEndDate = startDate;
    }

    // Filter data by date range
    const filteredConversations = conversations.filter(c => {
      const date = new Date(c.lastMessageAt);
      return date >= startDate && date <= endDate;
    });

    const filteredRequests = requests.filter(r => {
      const date = new Date(r.createdAt);
      return date >= startDate && date <= endDate;
    });

    const filteredAppointments = appointments.filter(a => {
      const date = new Date(a.date);
      return date >= startDate && date <= endDate;
    });

    const filteredCustomers = customers.filter(c => {
      const date = new Date(c.createdAt);
      return date >= startDate && date <= endDate;
    });

    // Previous period data for trends
    const previousConversations = conversations.filter(c => {
      const date = new Date(c.lastMessageAt);
      return date >= previousStartDate && date < previousEndDate;
    });

    const previousRequests = requests.filter(r => {
      const date = new Date(r.createdAt);
      return date >= previousStartDate && date < previousEndDate;
    });

    const previousCustomers = customers.filter(c => {
      const date = new Date(c.createdAt);
      return date >= previousStartDate && date < previousEndDate;
    });

    // Calculate metrics
    const activeConversations = filteredConversations.filter(c => c.state !== 'CLOSED').length;
    const conversationsByAI = filteredConversations.filter(c => !c.humanTakeover).length;
    const conversationsByHuman = filteredConversations.filter(c => c.humanTakeover).length;

    // Requests by state
    const requestsByState: Record<string, number> = {};
    filteredRequests.forEach(r => {
      requestsByState[r.state] = (requestsByState[r.state] || 0) + 1;
    });

    // AI performance
    const aiResolutionRate = filteredConversations.length > 0 
      ? (conversationsByAI / filteredConversations.length) * 100 
      : 0;
    
    const humanHandoffs = filteredConversations.filter(c => c.humanTakeover).length;
    const handoffRate = filteredConversations.length > 0
      ? (humanHandoffs / filteredConversations.length) * 100
      : 0;

    // Appointments
    const confirmedAppointments = filteredAppointments.filter(a => a.state === 'CONFIRMED').length;
    const completedAppointments = filteredAppointments.filter(a => a.state === 'COMPLETED').length;
    const noShows = filteredAppointments.filter(a => a.state === 'NO_SHOW').length;
    const noShowRate = filteredAppointments.length > 0
      ? (noShows / filteredAppointments.length) * 100
      : 0;

    // Time saved (estimate: 15 min per AI-handled conversation vs manual)
    const estimatedTimeSaved = (conversationsByAI * 15) / 60; // hours

    // Trends
    const conversationTrend = previousConversations.length > 0
      ? ((filteredConversations.length - previousConversations.length) / previousConversations.length) * 100
      : 0;

    const requestTrend = previousRequests.length > 0
      ? ((filteredRequests.length - previousRequests.length) / previousRequests.length) * 100
      : 0;

    const customerTrend = previousCustomers.length > 0
      ? ((filteredCustomers.length - previousCustomers.length) / previousCustomers.length) * 100
      : 0;

    return {
      totalConversations: filteredConversations.length,
      activeConversations,
      conversationsByAI,
      conversationsByHuman,
      avgResponseTime: 12, // mock - would calculate from message timestamps
      totalRequests: filteredRequests.length,
      requestsByState,
      requestsByAI: filteredRequests.length, // all created by AI in demo
      avgRequestCompletionTime: 24, // mock
      totalAppointments: filteredAppointments.length,
      confirmedAppointments,
      completedAppointments,
      noShowRate,
      totalCustomers: filteredCustomers.length,
      newCustomers: filteredCustomers.length,
      activeCustomers: filteredCustomers.length, // mock
      aiResolutionRate,
      avgConfidence: 0.87, // mock
      humanHandoffs,
      handoffRate,
      estimatedTimeSaved,
      avgTimePerRequest: 8, // mock
      conversationTrend,
      requestTrend,
      customerTrend,
    } as DashboardMetrics;
  }, [conversations, requests, appointments, customers, dateRange, customStart, customEnd]);

  return metrics;
}
