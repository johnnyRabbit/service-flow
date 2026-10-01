import { ReactNode } from 'react';
import { usePermission } from '../../hooks/usePermission';
import { Permission } from '../../lib/permissions';

interface PermissionGuardProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only if user has the required permission.
 * Optionally renders fallback if permission is missing.
 */
export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { can } = usePermission();
  
  if (!can(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface RequirePermissionProps {
  permission: Permission;
  children: ReactNode;
}

/**
 * Renders children only if user has the required permission.
 * Shows "Access Denied" message if permission is missing.
 */
export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { can } = usePermission();
  
  if (!can(permission)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">🔒</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
        <p className="text-sm text-gray-500 text-center max-w-md">
          Não tem permissão para aceder a esta página. 
          Contacte o administrador da sua organização se precisar de acesso.
        </p>
        <div className="mt-4 px-3 py-1.5 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600">
            Permissão necessária: <code className="font-mono">{permission}</code>
          </p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

interface PermissionButtonProps {
  permission: Permission;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabledClassName?: string;
  title?: string;
}

/**
 * Button that is disabled if user doesn't have permission.
 * Shows tooltip explaining why it's disabled.
 */
export function PermissionButton({ 
  permission, 
  children, 
  onClick, 
  className = '',
  disabledClassName = 'opacity-50 cursor-not-allowed',
  title 
}: PermissionButtonProps) {
  const { can } = usePermission();
  const hasAccess = can(permission);
  
  return (
    <button
      onClick={hasAccess ? onClick : undefined}
      className={`${className} ${!hasAccess ? disabledClassName : ''}`}
      disabled={!hasAccess}
      title={!hasAccess ? `Permissão necessária: ${permission}` : title}
    >
      {children}
    </button>
  );
}
