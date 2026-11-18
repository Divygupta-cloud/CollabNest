import React, { useState } from 'react';
import { UserPlus, Search } from 'lucide-react';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import {
  Button,
  Input,
  Select,
  Avatar,
  UserAvatar,
  getIllustratedAvatarUrl,
  Modal,
} from '../design-system/components';
import { useUsers, useTeams, userService, useCurrentUser } from '../services';
import { UserRole } from '../types';

export const UserManagementPage: React.FC = () => {
  const users = useUsers();
  const teams = useTeams();
  const currentUser = useCurrentUser();

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  // Add employee modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('DEVELOPER');
  const [newTitle, setNewTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('Product Engineering');
  const [newTeamId, setNewTeamId] = useState<string>(teams[0]?.id || '');

  const filteredUsers = users.filter((u) => {
    if (selectedRole !== 'ALL' && u.role !== selectedRole) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchTitle = u.title.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchTitle) return false;
    }
    return true;
  });

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    userService.createUser({
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      title: newTitle.trim() || 'Software Engineer',
      department: newDepartment,
      teamId: newTeamId || undefined,
      avatarUrl: getIllustratedAvatarUrl(newEmail.trim() || newName.trim()),
      status: 'ACTIVE',
    });

    setNewName('');
    setNewEmail('');
    setNewTitle('');
    setIsAddModalOpen(false);
  };

  const handleToggleStatus = (userId: string, currentStatus: 'ACTIVE' | 'INACTIVE') => {
    userService.updateUser(userId, {
      status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
  };

  const isLeaderOrAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'TEAM_LEAD';

  return (
    <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1, backgroundColor: '#161A1D' }}>
      <Breadcrumbs items={[{ label: 'Home', href: '/dashboard' }, { label: 'User Management' }]} />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
            Employee & User Directory
          </h1>
          <p style={{ fontSize: '13px', color: '#9FADBC', marginTop: '4px' }}>
            Manage staff accounts, assign roles (RBAC), and organize engineering teams.
          </p>
        </div>

        {isLeaderOrAdmin && (
          <Button
            appearance="primary"
            iconBefore={<UserPlus size={16} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Employee
          </Button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '240px' }}>
          <Input
            isCompact
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees by name, title..."
            iconBefore={<Search size={14} color="#9FADBC" />}
          />
        </div>

        <Select
          isCompact
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{ width: '150px' }}
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="TEAM_LEAD">Team Lead</option>
          <option value="DEVELOPER">Developer</option>
          <option value="QA">QA Engineer</option>
        </Select>
      </div>

      {/* Users Table */}
      <div
        style={{
          backgroundColor: '#22272B',
          border: '1px solid #333C48',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                backgroundColor: '#1D2125',
                borderBottom: '1px solid #333C48',
                fontSize: '11px',
                fontWeight: 700,
                color: '#8C9BAB',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <th style={{ padding: '10px 16px' }}>Employee</th>
              <th style={{ padding: '10px 16px' }}>Role</th>
              <th style={{ padding: '10px 16px' }}>Team</th>
              <th style={{ padding: '10px 16px' }}>Department</th>
              <th style={{ padding: '10px 16px' }}>Status</th>
              {isLeaderOrAdmin && <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => {
              const team = teams.find((t) => t.id === u.teamId);
              return (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: '1px solid #282E33',
                    fontSize: '13px',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Name, avatar, email */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <UserAvatar user={u} size="lg" />
                      <div>
                        <div style={{ fontWeight: 600, color: '#F1F2F4' }}>{u.name}</div>
                        <div style={{ fontSize: '11px', color: '#9FADBC' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
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
                    <div style={{ fontSize: '11px', color: '#8C9BAB', marginTop: '2px' }}>
                      {u.title}
                    </div>
                  </td>

                  {/* Team */}
                  <td style={{ padding: '12px 16px', color: '#F1F2F4' }}>
                    {team ? team.name : <span style={{ color: '#738496' }}>—</span>}
                  </td>

                  {/* Department */}
                  <td style={{ padding: '12px 16px', color: '#9FADBC' }}>{u.department}</td>

                  {/* Status */}
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '3px',
                        backgroundColor: u.status === 'ACTIVE' ? 'rgba(34, 160, 107, 0.2)' : 'rgba(248, 113, 113, 0.15)',
                        color: u.status === 'ACTIVE' ? '#4BCE97' : '#F87171',
                      }}
                    >
                      {u.status}
                    </span>
                  </td>

                  {/* Actions (Admin / Lead only) */}
                  {isLeaderOrAdmin && (
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <Button
                        appearance="subtle"
                        spacing="compact"
                        onClick={() => handleToggleStatus(u.id, u.status)}
                      >
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        footer={
          <>
            <Button appearance="subtle" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button appearance="primary" onClick={handleAddEmployee}>
              Save Employee
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '4px' }}>
              Full Name <span style={{ color: '#F87171' }}>*</span>
            </label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Liam Anderson"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '4px' }}>
              Work Email <span style={{ color: '#F87171' }}>*</span>
            </label>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="liam.anderson@collabnest.dev"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '4px' }}>
                Role (RBAC)
              </label>
              <Select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                style={{ width: '100%' }}
              >
                <option value="DEVELOPER">Developer</option>
                <option value="TEAM_LEAD">Team Leader</option>
                <option value="QA">QA Engineer</option>
                <option value="ADMIN">Administrator</option>
              </Select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '4px' }}>
                Team Assignment
              </label>
              <Select
                value={newTeamId}
                onChange={(e) => setNewTeamId(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">No Team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '4px' }}>
              Job Title
            </label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '4px' }}>
              Department
            </label>
            <Input
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              placeholder="e.g. Platform Engineering"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
