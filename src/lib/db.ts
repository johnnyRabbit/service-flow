import { Customer, ServiceRequest, Service, Conversation, Appointment, AuditLog, Organization } from '../types';
import { mockCustomers, mockRequests, mockServices, mockConversations, mockAppointments, mockOrganization, mockAuditLogs } from '../data/mockData';

// In-memory "database" per organization
type DB = {
  organization: Organization;
  customers: Customer[];
  services: Service[];
  requests: ServiceRequest[];
  conversations: Conversation[];
  appointments: Appointment[];
  auditLogs: AuditLog[];
};

const databases: Record<string, DB> = {
  org_1: {
    organization: mockOrganization,
    customers: [...mockCustomers],
    services: [...mockServices],
    requests: [...mockRequests],
    conversations: [...mockConversations],
    appointments: [...mockAppointments],
    auditLogs: [...mockAuditLogs],
  },
};

function getDB(orgId: string): DB {
  if (!databases[orgId]) {
    databases[orgId] = {
      organization: { ...mockOrganization, id: orgId, name: 'Nova Organização' },
      customers: [],
      services: [],
      requests: [],
      conversations: [],
      appointments: [],
      auditLogs: [],
    };
  }
  return databases[orgId];
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

// Audit log helper
function log(db: DB, entry: Omit<AuditLog, 'id' | 'organizationId' | 'timestamp'>) {
  db.auditLogs.unshift({
    ...entry,
    id: uid('log'),
    organizationId: db.organization.id,
    timestamp: now(),
  });
}

// ============ CUSTOMERS ============
export const customersRepo = {
  list(orgId: string): Customer[] {
    return getDB(orgId).customers;
  },
  get(orgId: string, id: string): Customer | undefined {
    return getDB(orgId).customers.find((c) => c.id === id);
  },
  create(orgId: string, data: Omit<Customer, 'id' | 'organizationId' | 'createdAt' | 'totalRequests'>): Customer {
    const db = getDB(orgId);
    const customer: Customer = {
      ...data,
      id: uid('cust'),
      organizationId: orgId,
      createdAt: now(),
      totalRequests: 0,
    };
    db.customers.unshift(customer);
    log(db, { actorType: 'USER', actorId: 'current', actorName: 'Utilizador', action: 'CREATED_CUSTOMER', entityType: 'CUSTOMER', entityId: customer.id, after: { name: customer.name } });
    return customer;
  },
  update(orgId: string, id: string, data: Partial<Customer>): Customer | undefined {
    const db = getDB(orgId);
    const idx = db.customers.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    const before = { ...db.customers[idx] };
    db.customers[idx] = { ...db.customers[idx], ...data };
    log(db, { actorType: 'USER', actorId: 'current', actorName: 'Utilizador', action: 'UPDATED_CUSTOMER', entityType: 'CUSTOMER', entityId: id, before, after: db.customers[idx] });
    return db.customers[idx];
  },
  remove(orgId: string, id: string): boolean {
    const db = getDB(orgId);
    const before = db.customers.find((c) => c.id === id);
    if (!before) return false;
    db.customers = db.customers.filter((c) => c.id !== id);
    log(db, { actorType: 'USER', actorId: 'current', actorName: 'Utilizador', action: 'DELETED_CUSTOMER', entityType: 'CUSTOMER', entityId: id, before });
    return true;
  },
};

// ============ SERVICES ============
export const servicesRepo = {
  list(orgId: string): Service[] {
    return getDB(orgId).services;
  },
  get(orgId: string, id: string): Service | undefined {
    return getDB(orgId).services.find((s) => s.id === id);
  },
  create(orgId: string, data: Omit<Service, 'id' | 'organizationId'>): Service {
    const db = getDB(orgId);
    const service: Service = { ...data, id: uid('svc'), organizationId: orgId };
    db.services.unshift(service);
    log(db, { actorType: 'USER', actorId: 'current', actorName: 'Utilizador', action: 'CREATED_SERVICE', entityType: 'SERVICE', entityId: service.id, after: { name: service.name } });
    return service;
  },
  update(orgId: string, id: string, data: Partial<Service>): Service | undefined {
    const db = getDB(orgId);
    const idx = db.services.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    db.services[idx] = { ...db.services[idx], ...data };
    log(db, { actorType: 'USER', actorId: 'current', actorName: 'Utilizador', action: 'UPDATED_SERVICE', entityType: 'SERVICE', entityId: id });
    return db.services[idx];
  },
  remove(orgId: string, id: string): boolean {
    const db = getDB(orgId);
    const len = db.services.length;
    db.services = db.services.filter((s) => s.id !== id);
    return db.services.length < len;
  },
};

// ============ REQUESTS ============
export const requestsRepo = {
  list(orgId: string): ServiceRequest[] {
    return getDB(orgId).requests;
  },
  get(orgId: string, id: string): ServiceRequest | undefined {
    return getDB(orgId).requests.find((r) => r.id === id);
  },
  create(orgId: string, data: Omit<ServiceRequest, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'customer' | 'service'>): ServiceRequest {
    const db = getDB(orgId);
    const customer = db.customers.find((c) => c.id === data.customerId);
    const service = db.services.find((s) => s.id === data.serviceId);
    if (!customer || !service) throw new Error('Customer or service not found');
    const request: ServiceRequest = {
      ...data,
      id: uid('req'),
      organizationId: orgId,
      customer,
      service,
      createdAt: now(),
      updatedAt: now(),
    };
    db.requests.unshift(request);
    log(db, { actorType: 'AI', actorId: 'ai_1', actorName: 'Assistente IA', action: 'CREATED_REQUEST', entityType: 'REQUEST', entityId: request.id, after: { state: request.state } });
    return request;
  },
  update(orgId: string, id: string, data: Partial<ServiceRequest>): ServiceRequest | undefined {
    const db = getDB(orgId);
    const idx = db.requests.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    const before = { ...db.requests[idx] };
    db.requests[idx] = { ...db.requests[idx], ...data, updatedAt: now() };
    log(db, { actorType: 'USER', actorId: 'current', actorName: 'Utilizador', action: 'UPDATED_REQUEST', entityType: 'REQUEST', entityId: id, before: { state: before.state }, after: { state: db.requests[idx].state } });
    return db.requests[idx];
  },
};

// ============ CONVERSATIONS ============
export const conversationsRepo = {
  list(orgId: string): Conversation[] {
    return getDB(orgId).conversations;
  },
  get(orgId: string, id: string): Conversation | undefined {
    return getDB(orgId).conversations.find((c) => c.id === id);
  },
  addMessage(orgId: string, convId: string, msg: { senderType: 'CUSTOMER' | 'AI' | 'USER' | 'SYSTEM'; senderName: string; content: string }): void {
    const db = getDB(orgId);
    const conv = db.conversations.find((c) => c.id === convId);
    if (!conv) return;
    const message = {
      id: uid('msg'),
      conversationId: convId,
      ...msg,
      timestamp: now(),
    };
    conv.messages.push(message);
    conv.lastMessage = msg.content;
    conv.lastMessageAt = now();
    if (msg.senderType !== 'USER') conv.unreadCount += 1;
  },
  updateState(orgId: string, convId: string, state: Conversation['state'], assignedUserId?: string): void {
    const db = getDB(orgId);
    const conv = db.conversations.find((c) => c.id === convId);
    if (!conv) return;
    const before = { state: conv.state };
    conv.state = state;
    if (assignedUserId) {
      conv.assignedUserId = assignedUserId;
      conv.humanTakeover = state === 'HUMAN_ACTIVE';
    }
    log(db, { actorType: state === 'HUMAN_ACTIVE' ? 'USER' : 'AI', actorId: 'current', actorName: state === 'HUMAN_ACTIVE' ? 'Utilizador' : 'Assistente IA', action: 'UPDATED_CONVERSATION_STATE', entityType: 'CONVERSATION', entityId: convId, before, after: { state } });
  },
};

// ============ ORGANIZATION ============
export const orgRepo = {
  get(orgId: string): Organization {
    return getDB(orgId).organization;
  },
  update(orgId: string, data: Partial<Organization>): Organization {
    const db = getDB(orgId);
    db.organization = { ...db.organization, ...data };
    log(db, { actorType: 'USER', actorId: 'current', actorName: 'Utilizador', action: 'UPDATED_ORGANIZATION', entityType: 'ORGANIZATION', entityId: orgId });
    return db.organization;
  },
};

// ============ AUDIT LOGS ============
export const auditRepo = {
  list(orgId: string): AuditLog[] {
    return getDB(orgId).auditLogs;
  },
};

// ============ APPOINTMENTS ============
export const appointmentsRepo = {
  list(orgId: string): Appointment[] {
    return getDB(orgId).appointments;
  },
  create(orgId: string, data: Omit<Appointment, 'id' | 'organizationId' | 'customer' | 'service'>): Appointment {
    const db = getDB(orgId);
    const customer = db.customers.find((c) => c.id === data.customerId);
    const service = db.services.find((s) => s.id === data.serviceId);
    if (!customer || !service) throw new Error('Customer or service not found');
    const apt: Appointment = { ...data, id: uid('apt'), organizationId: orgId, customer, service };
    db.appointments.unshift(apt);
    log(db, { actorType: 'AI', actorId: 'ai_1', actorName: 'Assistente IA', action: 'CREATED_APPOINTMENT', entityType: 'APPOINTMENT', entityId: apt.id, after: { date: apt.date, time: apt.time } });
    return apt;
  },
};
