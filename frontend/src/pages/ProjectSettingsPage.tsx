import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Settings,
  Users,
  Shield,
  Layers,
  GitCommit,
  Tag,
  Save,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { ProjectHeaderNav } from '../components/navigation/ProjectHeaderNav';
import {
  Button,
  Input,
  Select,
  Avatar,
  Lozenge,
  IssueTypeIcon,
} from '../design-system/components';
import {
  useProject,
  useUsers,
  useIssues,
  useCurrentUser,
  projectService,
} from '../services';
import { ProjectCategory } from '../types';
import { canCreateProject, getRoleBadge } from '../utils/permissions';
import { mockStore } from '../mocks/store';

type SettingsTab = 'general' | 'members' | 'roles' | 'issuetypes' | 'workflow' | 'labels';

export const ProjectSettingsPage: React.FC = () => {
  const { projectKey = 'CRM' } = useParams<{ projectKey: string }>();
  const project = useProject(projectKey);
  const users = useUsers();
  const issues = useIssues(project?.id);
  const currentUser = useCurrentUser();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [leadId, setLeadId] = useState(project?.leadId || '');
  const [category, setCategory] = useState<ProjectCategory>(project?.category || 'SOFTWARE');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const canEdit = canCreateProject(currentUser);

  // Sync state if project changes
  React.useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setLeadId(project.leadId);
      setCategory(project.category);
    }
  }, [project]);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !canEdit) return;
    projectService.updateProject(project.id, {
      name: name.trim(),
      description: description.trim(),
      leadId,
      category,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Collect project distinct labels with counts
  const labelCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    issues.forEach((i) => {
      i.labels.forEach((l) => {
        counts[l] = (counts[l] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [issues]);

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Settings size={15} /> },
    { id: 'members', label: 'Members', icon: <Users size={15} /> },
    { id: 'roles', label: 'Roles & Permissions', icon: <Shield size={15} /> },
    { id: 'issuetypes', label: 'Issue Types', icon: <Layers size={15} /> },
    { id: 'workflow', label: 'Workflow', icon: <GitCommit size={15} /> },
    { id: 'labels', label: 'Labels', icon: <Tag size={15} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ProjectHeaderNav />

      <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1, backgroundColor: '#161A1D' }}>
        <Breadcrumbs
          items={[
            { label: 'Projects', href: '/projects' },
            { label: project?.name || projectKey, href: `/projects/${projectKey}/overview` },
            { label: 'Project Settings' },
          ]}
        />

        {/* Header */}
        <div style={{ marginBottom: '24px', borderBottom: '1px solid #333C48', paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#F1F2F4', margin: 0 }}>
            Project Settings
          </h1>
          <p style={{ fontSize: '13px', color: '#9FADBC', marginTop: '4px' }}>
            Configure project details, members, roles, workflows, and issue types for {project?.name}.
          </p>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid #333C48',
            marginBottom: '24px',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? '#579DFF' : '#9FADBC',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #579DFF' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: '-1px',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: General Settings */}
        {activeTab === 'general' && (
          <form
            onSubmit={handleSaveGeneral}
            style={{
              maxWidth: '680px',
              backgroundColor: '#22272B',
              border: '1px solid #333C48',
              borderRadius: '6px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '6px' }}>
                  Project Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!canEdit}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '6px' }}>
                  Project Key
                </label>
                <Input value={project?.key || ''} disabled />
                <span style={{ fontSize: '11px', color: '#738496', marginTop: '4px', display: 'block' }}>
                  The project key is used as the prefix for issue keys (e.g. {project?.key}-101) and cannot be modified.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!canEdit}
                  rows={3}
                  style={{
                    width: '100%',
                    backgroundColor: '#1D2125',
                    border: '1px solid #333C48',
                    borderRadius: '3px',
                    padding: '8px 10px',
                    color: '#F1F2F4',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '6px' }}>
                    Project Lead
                  </label>
                  <Select
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                    disabled={!canEdit}
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9FADBC', marginBottom: '6px' }}>
                    Category
                  </label>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                    disabled={!canEdit}
                  >
                    <option value="SOFTWARE">Software Development</option>
                    <option value="OPERATIONS">Operations & DevOps</option>
                    <option value="MARKETING">Marketing & Growth</option>
                    <option value="BUSINESS">Business & Product</option>
                  </Select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #333C48' }}>
                <div>
                  {savedSuccess && (
                    <span style={{ fontSize: '13px', color: '#4BCE97', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} /> Changes saved successfully!
                    </span>
                  )}
                  {!canEdit && (
                    <span style={{ fontSize: '12px', color: '#8C9BAB', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={14} /> Only Administrators and Project Managers can modify settings.
                    </span>
                  )}
                </div>

                {canEdit && (
                  <Button appearance="primary" iconBefore={<Save size={15} />} type="submit">
                    Save Changes
                  </Button>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Members */}
        {activeTab === 'members' && (
          <div style={{ backgroundColor: '#22272B', border: '1px solid #333C48', borderRadius: '6px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#1D2125', borderBottom: '1px solid #333C48', fontSize: '11px', fontWeight: 700, color: '#8C9BAB', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 16px' }}>User</th>
                  <th style={{ padding: '10px 16px' }}>Email</th>
                  <th style={{ padding: '10px 16px' }}>Role</th>
                  <th style={{ padding: '10px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const badge = getRoleBadge(u.role);
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #282E33', fontSize: '13px' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Avatar name={u.name} src={u.avatarUrl} size="small" />
                          <div>
                            <span style={{ fontWeight: 600, color: '#F1F2F4' }}>{u.name}</span>
                            {u.id === project?.leadId && (
                              <span style={{ fontSize: '10px', color: '#FB923C', marginLeft: '8px', fontWeight: 700 }}>
                                (Lead)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#9FADBC' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: 'rgba(34, 160, 107, 0.15)', color: '#4BCE97' }}>
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Roles & Permissions Matrix */}
        {activeTab === 'roles' && (
          <div style={{ backgroundColor: '#22272B', border: '1px solid #333C48', borderRadius: '6px', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F1F2F4', marginBottom: '8px' }}>
              Project Role-Based Access Control (RBAC) Matrix
            </h3>
            <p style={{ fontSize: '13px', color: '#9FADBC', marginBottom: '20px' }}>
              Authorizations enforced strictly per enterprise Jira Agile standards:
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#1D2125', borderBottom: '1px solid #333C48', textAlign: 'left', color: '#8C9BAB' }}>
                  <th style={{ padding: '10px 12px' }}>Role</th>
                  <th style={{ padding: '10px 12px' }}>Teams</th>
                  <th style={{ padding: '10px 12px' }}>Projects</th>
                  <th style={{ padding: '10px 12px' }}>Epics</th>
                  <th style={{ padding: '10px 12px' }}>Sprints</th>
                  <th style={{ padding: '10px 12px' }}>Stories / Tasks / Bugs</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #282E33' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#F87171' }}>ADMIN</td>
                  <td style={{ padding: '10px 12px', color: '#4BCE97' }}>✓ Create & Assign</td>
                  <td style={{ padding: '10px 12px', color: '#4BCE97' }}>✓ Full (Delete)</td>
                  <td style={{ padding: '10px 12px', color: '#4BCE97' }}>✓ Full</td>
                  <td style={{ padding: '10px 12px', color: '#4BCE97' }}>✓ Full</td>
                  <td style={{ padding: '10px 12px', color: '#4BCE97' }}>✓ Full CRUD</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #282E33' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#FB923C' }}>PROJECT MANAGER</td>
                  <td style={{ padding: '10px 12px', color: '#4BCE97' }}>✓ Assign Members</td>
                  <td style={{ padding: '10px 12px', color: '#4BCE97' }}>✓ Create & Edit</td>
                  <td style={{ padding: '10px 12px', color: '#4BCE97' }}>✓ Full</td>
                  <td style={{ padding: '10px 12px', color: '#4BCE97' }}>✓ Start & Complete</td>
                  <td style={{ padding: '10px 12px', color: '#4BCE97' }}>✓ Full CRUD</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #282E33' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#C084FC' }}>TEAM LEAD</td>
                  <td style={{ padding: '10px 12px', color: '#8C9BAB' }}>Own Squad Members</td>
                  <td style={{ padding: '10px 12px', color: '#8C9BAB' }}>View / Edit Board</td>
                  <td style={{ padding: '10px 12px', color: '#4BCE97' }}>✓ Create & Assign</td>
                  <td style={{ padding: '10px 12px', color: '#4BCE97' }}>✓ Start & Complete</td>
                  <td style={{ padding: '10px 12px', color: '#4BCE97' }}>✓ Full CRUD & Review</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #282E33' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#60A5FA' }}>DEVELOPER</td>
                  <td style={{ padding: '10px 12px', color: '#738496' }}>View Only</td>
                  <td style={{ padding: '10px 12px', color: '#738496' }}>View Only</td>
                  <td style={{ padding: '10px 12px', color: '#738496' }}>View Only</td>
                  <td style={{ padding: '10px 12px', color: '#738496' }}>View Backlog</td>
                  <td style={{ padding: '10px 12px', color: '#4BCE97' }}>✓ Create & Transition</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#FBBF24' }}>QA / TEST</td>
                  <td style={{ padding: '10px 12px', color: '#738496' }}>View Only</td>
                  <td style={{ padding: '10px 12px', color: '#738496' }}>View Only</td>
                  <td style={{ padding: '10px 12px', color: '#738496' }}>View Only</td>
                  <td style={{ padding: '10px 12px', color: '#738496' }}>View Backlog</td>
                  <td style={{ padding: '10px 12px', color: '#4BCE97' }}>✓ File Bugs & Verify</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Issue Types Hierarchy */}
        {activeTab === 'issuetypes' && (
          <div style={{ backgroundColor: '#22272B', border: '1px solid #333C48', borderRadius: '6px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F1F2F4', marginBottom: '8px' }}>
              Project Issue Type Hierarchy
            </h3>
            <p style={{ fontSize: '13px', color: '#9FADBC', marginBottom: '20px' }}>
              In Jira architecture, projects contain Epics, which parent standard Issues, which parent Sub-tasks:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
              {/* Level 1: Epic */}
              <div style={{ padding: '16px', backgroundColor: '#1D2125', borderRadius: '6px', border: '1px solid #333C48', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <IssueTypeIcon type="EPIC" size={24} />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#C084FC' }}>
                    Level 1: Epic
                  </div>
                  <div style={{ fontSize: '13px', color: '#9FADBC', marginTop: '2px' }}>
                    Major body of work that can be broken down into specific stories, tasks, and bugs. Spans across sprints.
                  </div>
                  <div style={{ fontSize: '11px', color: '#738496', marginTop: '6px', fontWeight: 600 }}>
                    Managed by: Team Lead, Project Manager, Admin
                  </div>
                </div>
              </div>

              {/* Level 2: Standard Issues */}
              <div style={{ padding: '16px', backgroundColor: '#1D2125', borderRadius: '6px', border: '1px solid #333C48', marginLeft: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#579DFF' }}>
                  Level 2: Standard Issues (Children of Epic)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <IssueTypeIcon type="STORY" size={18} />
                  <div>
                    <span style={{ fontWeight: 600, color: '#F1F2F4', fontSize: '13px' }}>Story:</span>{' '}
                    <span style={{ color: '#9FADBC', fontSize: '13px' }}>User requirement delivering business value.</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <IssueTypeIcon type="TASK" size={18} />
                  <div>
                    <span style={{ fontWeight: 600, color: '#F1F2F4', fontSize: '13px' }}>Task:</span>{' '}
                    <span style={{ color: '#9FADBC', fontSize: '13px' }}>Technical work, chore, or engineering deliverable.</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <IssueTypeIcon type="BUG" size={18} />
                  <div>
                    <span style={{ fontWeight: 600, color: '#F1F2F4', fontSize: '13px' }}>Bug:</span>{' '}
                    <span style={{ color: '#9FADBC', fontSize: '13px' }}>Defect or impairment to existing software behavior.</span>
                  </div>
                </div>
              </div>

              {/* Level 3: Subtask */}
              <div style={{ padding: '16px', backgroundColor: '#1D2125', borderRadius: '6px', border: '1px solid #333C48', marginLeft: '48px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <IssueTypeIcon type="SUBTASK" size={20} />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#4BCE97' }}>
                    Level 3: Sub-task
                  </div>
                  <div style={{ fontSize: '13px', color: '#9FADBC', marginTop: '2px' }}>
                    Atomic work checklist item within a parent Story, Task, or Bug. Requires a parent issue.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Workflow */}
        {activeTab === 'workflow' && (
          <div style={{ backgroundColor: '#22272B', border: '1px solid #333C48', borderRadius: '6px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F1F2F4', marginBottom: '8px' }}>
              Project Status Workflow Pipeline
            </h3>
            <p style={{ fontSize: '13px', color: '#9FADBC', marginBottom: '24px' }}>
              Sequential transitions configured for Kanban & Sprint boards:
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
              {[
                { name: 'To Do / Backlog', desc: 'Ready for implementation', color: '#8C9BAB', bg: 'rgba(140, 155, 171, 0.15)' },
                { name: 'In Progress', desc: 'Active engineering development', color: '#579DFF', bg: 'rgba(87, 157, 255, 0.15)' },
                { name: 'In Review', desc: 'Code review & QA verification', color: '#C084FC', bg: 'rgba(192, 132, 252, 0.15)' },
                { name: 'Done', desc: 'Deployed & accepted', color: '#4BCE97', bg: 'rgba(34, 160, 107, 0.15)' },
              ].map((step, idx) => (
                <React.Fragment key={step.name}>
                  <div
                    style={{
                      minWidth: '180px',
                      padding: '16px',
                      borderRadius: '6px',
                      backgroundColor: step.bg,
                      border: `1px solid ${step.color}40`,
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 700, color: step.color, textTransform: 'uppercase' }}>
                      Step {idx + 1}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#F1F2F4', marginTop: '4px' }}>
                      {step.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9FADBC', marginTop: '4px' }}>
                      {step.desc}
                    </div>
                  </div>
                  {idx < 3 && <div style={{ color: '#8C9BAB', fontSize: '18px', fontWeight: 700 }}>→</div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Labels */}
        {activeTab === 'labels' && (
          <div style={{ backgroundColor: '#22272B', border: '1px solid #333C48', borderRadius: '6px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F1F2F4', marginBottom: '8px' }}>
              Project Labels & Tags ({labelCounts.length})
            </h3>
            <p style={{ fontSize: '13px', color: '#9FADBC', marginBottom: '20px' }}>
              Active semantic labels tagged across issues in {project?.name}:
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {labelCounts.map(([lbl, count]) => (
                <div
                  key={lbl}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#1D2125',
                    border: '1px solid #333C48',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '13px',
                  }}
                >
                  <Tag size={13} color="#579DFF" />
                  <span style={{ color: '#F1F2F4', fontWeight: 500 }}>{lbl}</span>
                  <span style={{ fontSize: '11px', color: '#8C9BAB', backgroundColor: '#282E33', padding: '1px 6px', borderRadius: '3px' }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
