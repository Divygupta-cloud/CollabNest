import React from 'react';
import { RotateCcw, Shield, Database, Sparkles, CheckCircle } from 'lucide-react';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { Button } from '../design-system/components';
import { mockStore } from '../mocks/store';

export const SettingsPage: React.FC = () => {
  const [resetSuccess, setResetSuccess] = React.useState(false);

  const handleResetData = () => {
    if (confirm('Reset all mock issues, comments, and sprints back to fresh defaults?')) {
      mockStore.resetToDefaults();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1, backgroundColor: '#161A1D', minHeight: '100%' }}>
      <div style={{ maxWidth: '800px' }}>
        <Breadcrumbs items={[{ label: 'Home', href: '/dashboard' }, { label: 'Settings' }]} />

        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F1F2F4', margin: 0, marginBottom: '6px' }}>
          Workspace & System Settings
        </h1>
        <p style={{ fontSize: '13px', color: '#9FADBC', marginBottom: '24px' }}>
          Phase 1 frontend configurations, mock store persistence controls, and role definitions.
        </p>

        {/* Reset Mock Data Card */}
        <div
          style={{
            backgroundColor: '#22272B',
            border: '1px solid #333C48',
            borderRadius: '6px',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Database size={18} color="#579DFF" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
              Mock Store & Local Storage Management
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: '#9FADBC', lineHeight: 1.5, marginBottom: '16px' }}>
            All issue creations, ticket drag-and-drop movements, comments, and sprint adjustments are persisted locally in browser <code style={{ backgroundColor: '#1D2125', color: '#579DFF', padding: '2px 4px', borderRadius: '3px' }}>localStorage</code>. Click below to restore initial seed data.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button
              appearance="default"
              iconBefore={<RotateCcw size={15} />}
              onClick={handleResetData}
            >
              Reset Seed Mock Data
            </Button>
            {resetSuccess && (
              <span style={{ fontSize: '12px', color: '#4BCE97', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} /> Data restored to original seed mocks!
              </span>
            )}
          </div>
        </div>

        {/* RBAC Role Definitions Table */}
        <div
          style={{
            backgroundColor: '#22272B',
            border: '1px solid #333C48',
            borderRadius: '6px',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Shield size={18} color="#C084FC" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
              Role-Based Access Control (RBAC) Matrix
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: '#9FADBC', marginBottom: '16px' }}>
            Permissions preview configured for Phase 1 simulation (switch personas via the user avatar menu in top right navbar):
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1D2125', borderBottom: '1px solid #333C48', textAlign: 'left', color: '#8C9BAB' }}>
                <th style={{ padding: '8px 12px' }}>Role</th>
                <th style={{ padding: '8px 12px' }}>Create Issue</th>
                <th style={{ padding: '8px 12px' }}>Manage Sprints</th>
                <th style={{ padding: '8px 12px' }}>Manage Users</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #282E33' }}>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: '#F1F2F4' }}>ADMIN</td>
                <td style={{ padding: '8px 12px', color: '#4BCE97' }}>✓ Full</td>
                <td style={{ padding: '8px 12px', color: '#4BCE97' }}>✓ Full</td>
                <td style={{ padding: '8px 12px', color: '#4BCE97' }}>✓ Add / Edit Employees</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #282E33' }}>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: '#F1F2F4' }}>TEAM_LEAD</td>
                <td style={{ padding: '8px 12px', color: '#4BCE97' }}>✓ Full</td>
                <td style={{ padding: '8px 12px', color: '#4BCE97' }}>✓ Start / Complete</td>
                <td style={{ padding: '8px 12px', color: '#4BCE97' }}>✓ Add Employees</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #282E33' }}>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: '#F1F2F4' }}>DEVELOPER</td>
                <td style={{ padding: '8px 12px', color: '#4BCE97' }}>✓ Create & Edit</td>
                <td style={{ padding: '8px 12px', color: '#8C9BAB' }}>View only</td>
                <td style={{ padding: '8px 12px', color: '#8C9BAB' }}>View directory</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: '#F1F2F4' }}>QA</td>
                <td style={{ padding: '8px 12px', color: '#4BCE97' }}>✓ File Bugs & Verify</td>
                <td style={{ padding: '8px 12px', color: '#8C9BAB' }}>View only</td>
                <td style={{ padding: '8px 12px', color: '#8C9BAB' }}>View directory</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
