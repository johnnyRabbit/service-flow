import { useAuth } from '../contexts/AuthContext';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '../lib/permissions';

export function usePermission() {
  const { user } = useAuth();
  const role = user?.role || 'VIEWER';

  return {
    role,
    can: (permission: Permission) => hasPermission(role, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(role, permissions),
  };
}
