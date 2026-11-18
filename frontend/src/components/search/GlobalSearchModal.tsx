import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, FolderKanban, Users, CheckCircle2 } from 'lucide-react';
import { useIssues, useProjects, useTeams } from '../../services';
import { IssueTypeIcon, PriorityIcon, Lozenge } from '../../design-system/components';
import { useNavigate } from 'react-router-dom';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const issues = useIssues();
  const projects = useProjects();
  const teams = useTeams();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchingIssues = trimmed
    ? issues.filter(
        (i) =>
          i.key.toLowerCase().includes(trimmed) ||
          i.title.toLowerCase().includes(trimmed) ||
          i.labels.some((l) => l.toLowerCase().includes(trimmed))
      ).slice(0, 6)
    : issues.slice(0, 4);

  const matchingProjects = trimmed
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.key.toLowerCase().includes(trimmed)
      )
    : projects.slice(0, 3);

  const matchingTeams = trimmed
    ? teams.filter((t) => t.name.toLowerCase().includes(trimmed))
    : teams.slice(0, 2);

  const handleSelectIssue = (issueKey: string, projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const projKey = project?.key || 'CRM';
    onClose();
    navigate(`/projects/${projKey}/board?issue=${issueKey}`);
  };

  const handleSelectProject = (projectKey: string) => {
    onClose();
    navigate(`/projects/${projectKey}/board`);
  };

  const handleSelectTeam = (teamId: string) => {
    onClose();
    navigate(`/teams/${teamId}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: '#22272B',
          borderRadius: '8px',
          border: '1px solid #333C48',
          boxShadow:
            '0 20px 32px -8px rgba(0, 0, 0, 0.7), 0 0 1px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: '1px solid #333C48',
          }}
        >
          <Search size={20} color="#579DFF" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search issues, projects, teams, or keys (e.g. CRM-102)..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              backgroundColor: 'transparent',
              color: '#F1F2F4',
            }}
          />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: '#282E33',
              color: '#9FADBC',
              border: '1px solid #333C48',
            }}
          >
            ESC to close
          </span>
        </div>

        {/* Results Body */}
        <div style={{ padding: '12px 0', overflowY: 'auto', flex: 1 }}>
          {/* Issues Category */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                padding: '4px 18px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#8C9BAB',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle2 size={12} /> {trimmed ? 'Matching Issues' : 'Recent Issues'}
            </div>
            {matchingIssues.length === 0 ? (
              <div style={{ padding: '8px 18px', fontSize: '13px', color: '#738496' }}>
                No issues found matching "{query}"
              </div>
            ) : (
              matchingIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => handleSelectIssue(issue.key, issue.projectId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 18px',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <IssueTypeIcon type={issue.type} size={16} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#9FADBC', width: '70px' }}>
                    {issue.key}
                  </span>
                  <span style={{ flex: 1, fontSize: '13px', color: '#F1F2F4', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {issue.title}
                  </span>
                  <Lozenge status={issue.status} />
                  <PriorityIcon priority={issue.priority} size={14} />
                  <ArrowRight size={14} color="#738496" />
                </div>
              ))
            )}
          </div>

          {/* Projects Category */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                padding: '4px 18px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#8C9BAB',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FolderKanban size={12} /> Projects
            </div>
            {matchingProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => handleSelectProject(proj.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 18px',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: proj.iconBgColor || '#0C66E4',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '11px',
                  }}
                >
                  {proj.key.substring(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F2F4' }}>
                    {proj.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9FADBC' }}>
                    Key: {proj.key} • {proj.category}
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#579DFF' }}>Open board →</span>
              </div>
            ))}
          </div>

          {/* Teams Category */}
          <div>
            <div
              style={{
                padding: '4px 18px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#8C9BAB',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Users size={12} /> Teams
            </div>
            {matchingTeams.map((team) => (
              <div
                key={team.id}
                onClick={() => handleSelectTeam(team.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 18px',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Users size={16} color="#9FADBC" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F2F4' }}>
                    {team.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9FADBC' }}>
                    {team.department} • {team.memberIds.length} members
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#579DFF' }}>View team →</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
