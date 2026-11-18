import React, { useState } from 'react';
import { LogOut, Settings, UserCheck, Shield, ChevronDown, FlaskConical } from 'lucide-react';
import { useCurrentUser, authService, useUsers } from '../../services';
import { usePermissions, ROLE_META } from '../../services/rbac';
import { UserAvatar } from '../../design-system/components';

export const ProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllPersonas, setShowAllPersonas] = useState(false);
  const currentUser = useCurrentUser();
  const allUsers = useUsers();
  const { can } = usePermissions();

  const roleStyle = ROLE_META[currentUser.role];

  // Show personas — one per role for quick switching
  const personaUsers = showAllPersonas ? allUsers : allUsers.slice(0, 5);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: isOpen ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
          border: 'none',
          padding: '2px 6px',
          borderRadius: '20px',
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = 'transparent';
        }}
        aria-label="Profile and Settings"
      >
        <UserAvatar user={currentUser} size="sm" />
        <ChevronDown size={14} color="#9FADBC" />
      </button>

      {isOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 590 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            className="animate-slide-down"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '296px',
              backgroundColor: '#22272B',
              borderRadius: '6px',
              border: '1px solid #333C48',
              boxShadow: '0 12px 24px -6px rgba(0, 0, 0, 0.6), 0 0 0 1px #333C48',
              zIndex: 600,
              overflow: 'hidden',
            }}
          >
            {/* User header */}
            <div style={{ padding: '16px', borderBottom: '1px solid #333C48' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <UserAvatar user={currentUser} size="md" />
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#F1F2F4', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9FADBC', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {currentUser.email}
                  </div>
                  <div style={{ marginTop: '5px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: roleStyle.bg,
                        color: roleStyle.color,
                        border: `1px solid ${roleStyle.border}`,
                        letterSpacing: '0.03em',
                      }}
                    >
                      {roleStyle.label.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dev-only: Switch Test Persona */}
            <div style={{ padding: '8px 0', borderBottom: '1px solid #333C48' }}>
              <div
                style={{
                  padding: '4px 16px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <FlaskConical size={11} color="#8C9BAB" />
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#8C9BAB',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Switch Test Persona (Dev Only)
                </span>
              </div>
              {personaUsers.map((user) => {
                const rm = ROLE_META[user.role];
                const isActive = user.id === currentUser.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      authService.switchUser(user);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '6px 16px',
                      cursor: 'pointer',
                      backgroundColor: isActive ? 'rgba(87, 157, 255, 0.12)' : 'transparent',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#282E33';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <UserAvatar user={user} size="sm" />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400, color: isActive ? '#579DFF' : '#F1F2F4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.name}
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '1px 5px',
                          borderRadius: '2px',
                          backgroundColor: rm.bg,
                          color: rm.color,
                          border: `1px solid ${rm.border}`,
                        }}
                      >
                        {rm.label}
                      </span>
                    </div>
                    {isActive && <UserCheck size={14} color="#579DFF" />}
                  </div>
                );
              })}
              {!showAllPersonas && allUsers.length > 5 && (
                <div
                  onClick={() => setShowAllPersonas(true)}
                  style={{
                    padding: '4px 16px',
                    fontSize: '12px',
                    color: '#579DFF',
                    cursor: 'pointer',
                    opacity: 0.8,
                  }}
                >
                  Show {allUsers.length - 5} more…
                </div>
              )}
            </div>

            {/* Permission-aware menu options */}
            <div style={{ padding: '4px 0' }}>
              {can('MANAGE_USERS') && (
                <a
                  href="#/users"
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    color: '#F1F2F4',
                    textDecoration: 'none',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Shield size={16} color="#9FADBC" /> User Management
                </a>
              )}
              {can('VIEW_SYSTEM_SETTINGS') && (
                <a
                  href="#/settings"
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    color: '#F1F2F4',
                    textDecoration: 'none',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Settings size={16} color="#9FADBC" /> System Settings
                </a>
              )}
              <div
                onClick={() => {
                  authService.logout();
                  setIsOpen(false);
                  window.location.hash = '#/login';
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  color: '#F87171',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={16} color="#F87171" /> Log out
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
