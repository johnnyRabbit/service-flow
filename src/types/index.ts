export type ConversationState = 'AI_ACTIVE' | 'WAITING_CUSTOMER' | 'NEEDS_HUMAN' | 'HUMAN_ACTIVE' | 'CLOSED';
export type RequestState = 'NEW' | 'REVIEWING' | 'QUOTE_PENDING' | 'QUOTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type AutonomyLevel = 1 | 2 | 3;
export type ActorType = 'USER' | 'AI' | 'SYSTEM';
export type Channel = 'WHATSAPP' | 'EMAIL' | 'WEB';
export type Urgency = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  phone: string;
  email: string;
  timezone: string;
  businessHours: BusinessHours;
  serviceZones: string[];
  autonomyLevel: AutonomyLevel;
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'TECHNICIAN' | 'VIEWER';
  avatar?: string;
}

export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
  totalRequests: number;
}

export interface Conversation {
  id: string;
  organizationId: string;
  customerId: string;
  customer: Customer;
  channel: Channel;
  state: ConversationState;
  aiEnabled: boolean;
  humanTakeover: boolean;
  assignedUserId?: string;
  assignedUser?: User;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  messages: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: 'CUSTOMER' | 'AI' | 'USER' | 'SYSTEM';
  senderName: string;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  metadata?: Record<string, any>;
}

export interface Attachment {
  id: string;
  type: 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO';
  url: string;
  name: string;
  size: number;
}

export interface ServiceRequest {
  id: string;
  organizationId: string;
  customerId: string;
  customer: Customer;
  serviceId: string;
  service: Service;
  state: RequestState;
  urgency: Urgency;
  problem: string;
  address: string;
  scheduledDate?: string;
  scheduledTime?: string;
  assignedUserId?: string;
  assignedUser?: User;
  data: Record<string, any>;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  icon: string;
  requiredFields: FieldConfig[];
  optionalFields: FieldConfig[];
  rules: ServiceRule[];
  estimatedDuration: number;
  basePrice?: number;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: 'TEXT' | 'SELECT' | 'MULTISELECT' | 'PHOTO' | 'DATE' | 'TIME' | 'NUMBER';
  required: boolean;
  options?: string[];
}

export interface ServiceRule {
  id: string;
  condition: string;
  action: 'HUMAN_HANDOFF' | 'ESCALATE_URGENCY' | 'AUTO_APPROVE' | 'NOTIFY';
  description: string;
}

export interface Appointment {
  id: string;
  organizationId: string;
  customerId: string;
  customer: Customer;
  serviceId: string;
  service: Service;
  date: string;
  time: string;
  duration: number;
  assignedUserId?: string;
  assignedUser?: User;
  state: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
}

export interface AutomationRule {
  id: string;
  organizationId: string;
  name: string;
  trigger: string;
  conditions: string[];
  actions: string[];
  delay?: number;
  delayUnit?: 'MINUTES' | 'HOURS' | 'DAYS';
  enabled: boolean;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  actorType: ActorType;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  timestamp: string;
}

export interface DashboardMetrics {
  totalConversations: number;
  activeConversations: number;
  totalRequests: number;
  requestsByAI: number;
  humanHandoffs: number;
  appointmentsToday: number;
  leads: number;
  estimatedTimeSaved: number;
  avgResponseTime: number;
  customerSatisfaction: number;
}
