import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Customer, Service, ServiceRequest, Conversation, Appointment, Organization, AuditLog } from '../types';
import { customersRepo, servicesRepo, requestsRepo, conversationsRepo, appointmentsRepo, orgRepo, auditRepo } from '../lib/db';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface DataContextType {
  // Data
  organization: Organization;
  customers: Customer[];
  services: Service[];
  requests: ServiceRequest[];
  conversations: Conversation[];
  appointments: Appointment[];
  auditLogs: AuditLog[];

  // Organization
  updateOrganization: (data: Partial<Organization>) => void;

  // Customers
  createCustomer: (data: Omit<Customer, 'id' | 'organizationId' | 'createdAt' | 'totalRequests'>) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Services
  createService: (data: Omit<Service, 'id' | 'organizationId'>) => Service;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;

  // Requests
  createRequest: (data: Omit<ServiceRequest, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'customer' | 'service'>) => ServiceRequest;
  updateRequest: (id: string, data: Partial<ServiceRequest>) => void;

  // Conversations
  addMessage: (convId: string, msg: { senderType: 'CUSTOMER' | 'AI' | 'USER' | 'SYSTEM'; senderName: string; content: string }) => void;
  updateConversationState: (convId: string, state: Conversation['state'], assignedUserId?: string) => void;

  // Appointments
  createAppointment: (data: Omit<Appointment, 'id' | 'organizationId' | 'customer' | 'service'>) => Appointment;

  // Refresh
  refresh: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const orgId = user?.organizationId || 'org_1';
  const [, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const organization = orgRepo.get(orgId);
  const customers = customersRepo.list(orgId);
  const services = servicesRepo.list(orgId);
  const requests = requestsRepo.list(orgId);
  const conversations = conversationsRepo.list(orgId);
  const appointments = appointmentsRepo.list(orgId);
  const auditLogs = auditRepo.list(orgId);

  const updateOrganization = (data: Partial<Organization>) => {
    orgRepo.update(orgId, data);
    refresh();
    addToast({ type: 'success', title: 'Organização atualizada' });
  };

  const createCustomer = (data: Omit<Customer, 'id' | 'organizationId' | 'createdAt' | 'totalRequests'>) => {
    const c = customersRepo.create(orgId, data);
    refresh();
    addToast({ type: 'success', title: 'Cliente criado', message: c.name });
    return c;
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    customersRepo.update(orgId, id, data);
    refresh();
    addToast({ type: 'success', title: 'Cliente atualizado' });
  };

  const deleteCustomer = (id: string) => {
    customersRepo.remove(orgId, id);
    refresh();
    addToast({ type: 'info', title: 'Cliente removido' });
  };

  const createService = (data: Omit<Service, 'id' | 'organizationId'>) => {
    const s = servicesRepo.create(orgId, data);
    refresh();
    addToast({ type: 'success', title: 'Serviço criado', message: s.name });
    return s;
  };

  const updateService = (id: string, data: Partial<Service>) => {
    servicesRepo.update(orgId, id, data);
    refresh();
    addToast({ type: 'success', title: 'Serviço atualizado' });
  };

  const deleteService = (id: string) => {
    servicesRepo.remove(orgId, id);
    refresh();
    addToast({ type: 'info', title: 'Serviço removido' });
  };

  const createRequest = (data: Omit<ServiceRequest, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'customer' | 'service'>) => {
    const r = requestsRepo.create(orgId, data);
    refresh();
    addToast({ type: 'success', title: 'Pedido criado pela IA', message: `${r.service.name} — ${r.customer.name}` });
    return r;
  };

  const updateRequest = (id: string, data: Partial<ServiceRequest>) => {
    requestsRepo.update(orgId, id, data);
    refresh();
    addToast({ type: 'success', title: 'Pedido atualizado' });
  };

  const addMessage = (convId: string, msg: { senderType: 'CUSTOMER' | 'AI' | 'USER' | 'SYSTEM'; senderName: string; content: string }) => {
    conversationsRepo.addMessage(orgId, convId, msg);
    refresh();
  };

  const updateConversationState = (convId: string, state: Conversation['state'], assignedUserId?: string) => {
    conversationsRepo.updateState(orgId, convId, state, assignedUserId);
    refresh();
    if (state === 'HUMAN_ACTIVE') {
      addToast({ type: 'info', title: 'Conversa assumida', message: 'Você está agora a gerir esta conversa' });
    }
  };

  const createAppointment = (data: Omit<Appointment, 'id' | 'organizationId' | 'customer' | 'service'>) => {
    const a = appointmentsRepo.create(orgId, data);
    refresh();
    addToast({ type: 'success', title: 'Marcação criada', message: `${a.date} às ${a.time}` });
    return a;
  };

  return (
    <DataContext.Provider
      value={{
        organization,
        customers,
        services,
        requests,
        conversations,
        appointments,
        auditLogs,
        updateOrganization,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        createService,
        updateService,
        deleteService,
        createRequest,
        updateRequest,
        addMessage,
        updateConversationState,
        createAppointment,
        refresh,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
