import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';
import { Button, Input } from '../design-system/components';
import { useUsers, authService } from '../services';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const users = useUsers();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('user-1');

  const handleQuickLogin = (userId: string) => {
    authService.loginWithUserId(userId);
    navigate('/dashboard');
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      authService.loginWithUserId(selectedUserId);
    }
    navigate('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#161A1D',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        className="animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#22272B',
          borderRadius: '6px',
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.5), 0 0 1px rgba(0, 0, 0, 0.4)',
          border: '1px solid #333C48',
          padding: '36px 40px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: '#0C66E4',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 4px 8px rgba(12, 102, 228, 0.4)',
            }}
          >
            <Layers size={26} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#F1F2F4', margin: 0 }}>
            CollabNest
          </h1>
          <p style={{ fontSize: '14px', color: '#9FADBC', marginTop: '4px' }}>
            Atlassian Jira-Style Project Management
          </p>
        </div>

        {/* Quick Demo Persona Login */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#8C9BAB',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '10px',
            }}
          >
            Quick 1-Click Demo Login (Role-Based)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {users.slice(0, 4).map((u) => {
              const isSelected = selectedUserId === u.id;
              return (
                <div
                  key={u.id}
                  onClick={() => {
                    setSelectedUserId(u.id);
                    handleQuickLogin(u.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: isSelected ? '1.5px solid #579DFF' : '1px solid #333C48',
                    backgroundColor: isSelected ? 'rgba(87, 157, 255, 0.15)' : '#1D2125',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#282E33';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#1D2125';
                  }}
                >
                  <img
                    src={u.avatarUrl}
                    alt={u.name}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F2F4' }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9FADBC' }}>
                      {u.title}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor:
                        u.role === 'ADMIN'
                          ? 'rgba(248, 113, 113, 0.15)'
                          : u.role === 'TEAM_LEAD'
                          ? 'rgba(192, 132, 252, 0.15)'
                          : u.role === 'QA'
                          ? 'rgba(251, 191, 36, 0.15)'
                          : 'rgba(96, 165, 250, 0.15)',
                      color:
                        u.role === 'ADMIN'
                          ? '#F87171'
                          : u.role === 'TEAM_LEAD'
                          ? '#C084FC'
                          : u.role === 'QA'
                          ? '#FBBF24'
                          : '#60A5FA',
                    }}
                  >
                    {u.role === 'ADMIN' ? 'Admin' : u.role === 'TEAM_LEAD' ? 'Team Lead' : u.role}
                  </span>
                  <ArrowRight size={14} color="#579DFF" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#738496' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#333C48' }} />
          <span style={{ padding: '0 12px', fontSize: '12px' }}>or sign in with password</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#333C48' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleFormLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '4px' }}>
              Work Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.rivera@collabnest.dev"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '4px' }}>
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button appearance="primary" type="submit" style={{ width: '100%', height: '36px', marginTop: '6px' }}>
            Sign in to CollabNest
          </Button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#738496' }}>
          Phase 1 Mock Authentication • No real credentials required
        </div>
      </div>
    </div>
  );
};
