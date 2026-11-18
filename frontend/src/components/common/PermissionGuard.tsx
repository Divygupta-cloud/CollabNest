/**
 * PermissionGuard
 *
 * Wraps content that should only be visible/accessible to users with the
 * required permission. Two usage modes:
 *
 * 1. Conditional render (hide element):
 *    <PermissionGuard permission="CREATE_SPRINT">
 *      <Button>Create Sprint</Button>
 *    </PermissionGuard>
 *
 * 2. Full-page access guard (show a 403 screen):
 *    <PermissionGuard permission="MANAGE_USERS" fallback={<ForbiddenPage />}>
 *      <UserManagementPage />
 *    </PermissionGuard>
 */

import React from 'react';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { usePermissions, Permission } from '../../services/rbac';
import { ROLE_META } from '../../services/rbac';

interface PermissionGuardProps {
  /** The single permission required to see the children */
  permission: Permission;
  /** What to render if access is denied. Defaults to null (element hidden). */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  fallback = null,
  children,
}) => {
  const { can } = usePermissions();

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// ─── Standalone 403 page ──────────────────────────────────────────────────────

export const ForbiddenPage: React.FC<{ requiredPermission?: string }> = ({
  requiredPermission,
}) => {
  const { currentUser } = usePermissions();
  const roleMeta = ROLE_META[currentUser.role];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#161A1D',
        color: '#9FADBC',
        padding: '48px 24px',
        gap: '20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'rgba(248, 113, 113, 0.12)',
          border: '1.5px solid rgba(248, 113, 113, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
        }}
      >
        <ShieldOff size={32} color="#F87171" />
      </div>

      <div>
        <div style={{ fontSize: '22px', fontWeight: 700, color: '#F1F2F4', marginBottom: '8px' }}>
          Access Denied
        </div>
        <div style={{ fontSize: '14px', color: '#9FADBC', maxWidth: '380px', lineHeight: 1.6 }}>
          Your current role{' '}
          <span
            style={{
              display: 'inline-block',
              padding: '1px 7px',
              borderRadius: '3px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: roleMeta.bg,
              color: roleMeta.color,
              border: `1px solid ${roleMeta.border}`,
              verticalAlign: 'middle',
            }}
          >
            {roleMeta.label}
          </span>{' '}
          does not have permission to access this area.
          {requiredPermission && (
            <>
              {' '}
              Required: <code style={{ fontSize: '12px', color: '#579DFF' }}>{requiredPermission}</code>
            </>
          )}
        </div>
      </div>

      <button
        onClick={() => window.history.back()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          borderRadius: '4px',
          border: '1px solid #333C48',
          backgroundColor: 'transparent',
          color: '#9FADBC',
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          marginTop: '8px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#22272B';
          e.currentTarget.style.color = '#F1F2F4';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#9FADBC';
        }}
      >
        <ArrowLeft size={16} />
        Go back
      </button>
    </div>
  );
};
