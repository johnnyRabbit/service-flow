// =============================================================================
// ServiceFlow AI - Permission System
// =============================================================================
// Role-Based Access Control (RBAC) with granular permissions
// =============================================================================

export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'VIEWER';

export type Permission = 
  // Dashboard
  | 'dashboard:view'
  
  // Inbox & Conversations
  | 'inbox:view_all'
  | 'inbox:view_assigned'
  | 'inbox:respond'
  | 'inbox:takeover'
  | 'inbox:close'
  | 'inbox:transfer'
  
  // Requests
  | 'requests:view_all'
  | 'requests:view_assigned'
  | 'requests:create'
  | 'requests:update'
  | 'requests:delete'
  | 'requests:assign'
  
  // Customers
  | 'customers:view_all'
  | 'customers:create'
  | 'customers:update'
  | 'customers:delete'
  
  // Services
  | 'services:view'
  | 'services:create'
  | 'services:update'
  | 'services:delete'
  
  // Appointments
  | 'appointments:view_all'
  | 'appointments:view_assigned'
  | 'appointments:create'
  | 'appointments:update'
  | 'appointments:delete'
  | 'appointments:assign'
  
  // Automations
  | 'automations:view'
  | 'automations:create'
  | 'automations:update'
  | 'automations:delete'
  
  // Team Management
  | 'team:view'
  | 'team:invite'
  | 'team:update_roles'
  | 'team:remove'
  
  // Organization Settings
  | 'settings:view'
  | 'settings:update_general'
  | 'settings:update_billing'
  | 'settings:update_integrations'
  
  // Audit & Security
  | 'audit:view'
  | 'audit:export'
  
  // AI & Handoffs
  | 'ai:view_console'
  | 'ai:configure_autonomy'
  | 'handoffs:view'
  | 'handoffs:accept'
  | 'handoffs:reject';

// Permission matrix by role
export const rolePermissions: Record<Role, Permission[]> = {
  OWNER: [
    // Dashboard
    'dashboard:view',
    
    // Inbox
    'inbox:view_all',
    'inbox:respond',
    'inbox:takeover',
    'inbox:close',
    'inbox:transfer',
    
    // Requests
    'requests:view_all',
    'requests:create',
    'requests:update',
    'requests:delete',
    'requests:assign',
    
    // Customers
    'customers:view_all',
    'customers:create',
    'customers:update',
    'customers:delete',
    
    // Services
    'services:view',
    'services:create',
    'services:update',
    'services:delete',
    
    // Appointments
    'appointments:view_all',
    'appointments:create',
    'appointments:update',
    'appointments:delete',
    'appointments:assign',
    
    // Automations
    'automations:view',
    'automations:create',
    'automations:update',
    'automations:delete',
    
    // Team
    'team:view',
    'team:invite',
    'team:update_roles',
    'team:remove',
    
    // Settings
    'settings:view',
    'settings:update_general',
    'settings:update_billing',
    'settings:update_integrations',
    
    // Audit
    'audit:view',
    'audit:export',
    
    // AI & Handoffs
    'ai:view_console',
    'ai:configure_autonomy',
    'handoffs:view',
    'handoffs:accept',
    'handoffs:reject',
  ],
  
  ADMIN: [
    // Dashboard
    'dashboard:view',
    
    // Inbox
    'inbox:view_all',
    'inbox:respond',
    'inbox:takeover',
    'inbox:close',
    'inbox:transfer',
    
    // Requests
    'requests:view_all',
    'requests:create',
    'requests:update',
    'requests:delete',
    'requests:assign',
    
    // Customers
    'customers:view_all',
    'customers:create',
    'customers:update',
    'customers:delete',
    
    // Services
    'services:view',
    'services:create',
    'services:update',
    'services:delete',
    
    // Appointments
    'appointments:view_all',
    'appointments:create',
    'appointments:update',
    'appointments:delete',
    'appointments:assign',
    
    // Automations
    'automations:view',
    'automations:create',
    'automations:update',
    'automations:delete',
    
    // Team
    'team:view',
    'team:invite',
    'team:update_roles',
    'team:remove',
    
    // Settings
    'settings:view',
    'settings:update_general',
    'settings:update_integrations',
    
    // Audit
    'audit:view',
    
    // AI & Handoffs
    'ai:view_console',
    'ai:configure_autonomy',
    'handoffs:view',
    'handoffs:accept',
    'handoffs:reject',
  ],
  
  MANAGER: [
    // Dashboard
    'dashboard:view',
    
    // Inbox
    'inbox:view_all',
    'inbox:respond',
    'inbox:takeover',
    'inbox:close',
    'inbox:transfer',
    
    // Requests
    'requests:view_all',
    'requests:create',
    'requests:update',
    'requests:assign',
    
    // Customers
    'customers:view_all',
    'customers:create',
    'customers:update',
    
    // Services
    'services:view',
    
    // Appointments
    'appointments:view_all',
    'appointments:create',
    'appointments:update',
    'appointments:assign',
    
    // Automations
    'automations:view',
    
    // Team
    'team:view',
    
    // Settings
    'settings:view',
    
    // Audit
    'audit:view',
    
    // AI & Handoffs
    'ai:view_console',
    'handoffs:view',
    'handoffs:accept',
  ],
  
  TECHNICIAN: [
    // Dashboard
    'dashboard:view',
    
    // Inbox
    'inbox:view_assigned',
    'inbox:respond',
    'inbox:takeover',
    'inbox:close',
    
    // Requests
    'requests:view_assigned',
    'requests:update',
    
    // Customers
    'customers:view_all',
    
    // Services
    'services:view',
    
    // Appointments
    'appointments:view_assigned',
    'appointments:update',
    
    // Settings
    'settings:view',
    
    // Handoffs
    'handoffs:view',
    'handoffs:accept',
  ],
  
  VIEWER: [
    // Dashboard
    'dashboard:view',
    
    // Inbox
    'inbox:view_assigned',
    
    // Requests
    'requests:view_assigned',
    
    // Customers
    'customers:view_all',
    
    // Services
    'services:view',
    
    // Appointments
    'appointments:view_assigned',
    
    // Settings
    'settings:view',
  ],
};

// Helper functions
export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

// Role metadata
export const roleMetadata: Record<Role, {
  label: string;
  description: string;
  color: string;
  icon: string;
}> = {
  OWNER: {
    label: 'Proprietário',
    description: 'Acesso total à organização, incluindo billing e integrações',
    color: 'bg-purple-100 text-purple-700',
    icon: '👑',
  },
  ADMIN: {
    label: 'Administrador',
    description: 'Acesso quase total, sem gestão de billing',
    color: 'bg-blue-100 text-blue-700',
    icon: '🛡️',
  },
  MANAGER: {
    label: 'Gestor',
    description: 'Gere equipa e operações, sem poder eliminar dados críticos',
    color: 'bg-green-100 text-green-700',
    icon: '👔',
  },
  TECHNICIAN: {
    label: 'Técnico',
    description: 'Acede apenas a pedidos e marcações atribuídos',
    color: 'bg-orange-100 text-orange-700',
    icon: '🔧',
  },
  VIEWER: {
    label: 'Visualizador',
    description: 'Apenas leitura, sem poder alterar dados',
    color: 'bg-gray-100 text-gray-700',
    icon: '👁️',
  },
};

// Permission categories for UI
export const permissionCategories = {
  'Dashboard': ['dashboard:view'],
  'Inbox & Conversas': [
    'inbox:view_all',
    'inbox:view_assigned',
    'inbox:respond',
    'inbox:takeover',
    'inbox:close',
    'inbox:transfer',
  ],
  'Pedidos': [
    'requests:view_all',
    'requests:view_assigned',
    'requests:create',
    'requests:update',
    'requests:delete',
    'requests:assign',
  ],
  'Clientes': [
    'customers:view_all',
    'customers:create',
    'customers:update',
    'customers:delete',
  ],
  'Serviços': [
    'services:view',
    'services:create',
    'services:update',
    'services:delete',
  ],
  'Marcações': [
    'appointments:view_all',
    'appointments:view_assigned',
    'appointments:create',
    'appointments:update',
    'appointments:delete',
    'appointments:assign',
  ],
  'Automações': [
    'automations:view',
    'automations:create',
    'automations:update',
    'automations:delete',
  ],
  'Equipa': [
    'team:view',
    'team:invite',
    'team:update_roles',
    'team:remove',
  ],
  'Definições': [
    'settings:view',
    'settings:update_general',
    'settings:update_billing',
    'settings:update_integrations',
  ],
  'Audit & Segurança': [
    'audit:view',
    'audit:export',
  ],
  'IA & Handoffs': [
    'ai:view_console',
    'ai:configure_autonomy',
    'handoffs:view',
    'handoffs:accept',
    'handoffs:reject',
  ],
};
