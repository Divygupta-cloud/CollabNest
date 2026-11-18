import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  User as UserIcon,
  CheckSquare,
  MessageSquare,
  Clock,
  Paperclip,
  Link2,
  FileText,
  Download,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Layers,
  Check,
  MoreHorizontal,
  Edit2,
  Activity,
} from 'lucide-react';
import {
  Lozenge,
  IssueTypeIcon,
  PriorityIcon,
  Avatar,
  Button,
  Select,
  Tag,
} from '../../design-system/components';
import {
  useIssue,
  useIssues,
  useProjects,
  useUsers,
  useSprints,
  useIssueComments,
  issueService,
  useCurrentUser,
} from '../../services';
import { IssueStatus, IssuePriority, Issue, LinkRelationship, LinkedIssue, IssueAttachment } from '../../types';
import { canAssignEpic, canDeleteIssue } from '../../utils/permissions';

interface IssueDetailModalProps {
  issueKey: string | null;
  onClose: () => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issueKey,
  onClose,
}) => {
  const issue = useIssue(issueKey || '');
  const [searchParams, setSearchParams] = useSearchParams();
  const projects = useProjects();
  const users = useUsers();
  const currentUser = useCurrentUser();
  const comments = useIssueComments(issue?.id || '');

  const projectIssues = useIssues(issue?.projectId || '');
  const sprints = useSprints(issue?.projectId || '');

  // Local editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState('');

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');

  // Subtask state & menu
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [activeMenuSubtaskId, setActiveMenuSubtaskId] = useState<string | null>(null);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  const [subtaskMenuSubmenu, setSubtaskMenuSubmenu] = useState<'assign' | 'status' | null>(null);

  // Label state
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [labelInput, setLabelInput] = useState('');

  // AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAppliedNotification, setAiAppliedNotification] = useState<string | null>(null);

  // Linked Issue state
  const [isLinkingIssue, setIsLinkingIssue] = useState(false);
  const [linkType, setLinkType] = useState<LinkRelationship>('relates to');
  const [targetIssueKey, setTargetIssueKey] = useState('');

  useEffect(() => {
    if (issue?.id) {
      issueService.fetchComments(issue.id);
    }
  }, [issue?.id]);

  const epics = useMemo(() => {
    return projectIssues.filter((i) => i.type === 'EPIC' && i.id !== issue?.id);
  }, [projectIssues, issue?.id]);

  const childIssues = useMemo(() => {
    if (!issue || issue.type !== 'EPIC') return [];
    return projectIssues.filter(
      (i) => i.epicId === issue.id || i.epicId === issue.key
    );
  }, [projectIssues, issue]);

  const parentEpic = useMemo(() => {
    if (!issue || !issue.epicId) return undefined;
    return epics.find((e) => e.id === issue.epicId || e.key === issue.epicId);
  }, [epics, issue]);

  const siblingStories = useMemo(() => {
    if (!issue || !issue.epicId) return [];
    return projectIssues.filter(
      (i) => (i.epicId === issue.epicId || (parentEpic && i.epicId === parentEpic.id)) && i.id !== issue.id
    );
  }, [projectIssues, issue, parentEpic]);

  const parentIssue = useMemo(() => {
    if (!issue || !issue.parentIssueId) return undefined;
    return projectIssues.find((i) => i.id === issue.parentIssueId || i.key === issue.parentIssueId);
  }, [projectIssues, issue]);

  const otherIssues = useMemo(() => {
    return projectIssues.filter((i) => i.id !== issue?.id);
  }, [projectIssues, issue?.id]);

  const currentAssigneeIds: string[] = useMemo(() => {
    if (issue?.assigneeIds && issue.assigneeIds.length > 0) {
      return issue.assigneeIds;
    }
    return issue?.assigneeId ? [issue.assigneeId] : [];
  }, [issue?.assigneeIds, issue?.assigneeId]);

  const assignedUsers = useMemo(() => {
    return currentAssigneeIds
      .map((id) => users.find((u) => u.id === id))
      .filter((u): u is typeof users[0] => !!u);
  }, [currentAssigneeIds, users]);

  if (!issueKey || !issue) return null;

  const project = projects.find((p) => p.id === issue.projectId);
  const assignee = users.find((u) => u.id === issue.assigneeId);
  const reporter = users.find((u) => u.id === issue.reporterId);

  const isEpic = issue.type === 'EPIC';
  const userCanAssign = isEpic ? canAssignEpic(currentUser) : true;
  const userCanDelete = canDeleteIssue(currentUser);

  const handleTitleSubmit = () => {
    if (titleValue.trim() && titleValue !== issue.title) {
      issueService.updateIssue(issue.id, { title: titleValue.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleDescSubmit = () => {
    if (descValue !== issue.description) {
      issueService.updateIssue(issue.id, { description: descValue });
    }
    setIsEditingDesc(false);
  };

  const handleStatusChange = (newStatus: IssueStatus) => {
    issueService.moveIssueStatus(issue.id, newStatus);
  };

  const handlePriorityChange = (newPriority: IssuePriority) => {
    issueService.updateIssue(issue.id, { priority: newPriority });
  };

  const handleAddAssignee = (userId: string) => {
    if (!userCanAssign || !userId) return;
    if (currentAssigneeIds.includes(userId)) return;
    const nextIds = [...currentAssigneeIds, userId];
    issueService.updateIssue(issue.id, {
      assigneeIds: nextIds,
      assigneeId: nextIds[0],
    });
  };

  const handleRemoveAssignee = (userId: string) => {
    if (!userCanAssign) return;
    const nextIds = currentAssigneeIds.filter((id) => id !== userId);
    issueService.updateIssue(issue.id, {
      assigneeIds: nextIds,
      assigneeId: nextIds[0] || undefined,
    });
  };

  const handleAssignToMe = () => {
    if (!userCanAssign) return;
    if (currentAssigneeIds.includes(currentUser.id)) return;
    const nextIds = [...currentAssigneeIds, currentUser.id];
    issueService.updateIssue(issue.id, {
      assigneeIds: nextIds,
      assigneeId: nextIds[0],
    });
  };

  const handleClearAllAssignees = () => {
    if (!userCanAssign) return;
    issueService.updateIssue(issue.id, {
      assigneeIds: [],
      assigneeId: undefined,
    });
  };

  const handleAssigneeChange = (newAssigneeId: string) => {
    if (!userCanAssign) return;
    if (!newAssigneeId) {
      handleClearAllAssignees();
    } else {
      handleAddAssignee(newAssigneeId);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    issueService.addComment(issue.id, newComment.trim());
    setNewComment('');
  };

  const handleToggleSubtask = (subId: string) => {
    const currentSubs = issue.subtasks || [];
    const target = currentSubs.find((s) => s.id === subId);
    if (!target) return;
    const newCompleted = !target.completed;
    const newStatus: IssueStatus = newCompleted ? 'DONE' : 'TODO';

    const updated = currentSubs.map((st) =>
      st.id === subId ? { ...st, completed: newCompleted, status: newStatus } : st
    );

    issueService.updateIssue(issue.id, { subtasks: updated });
    issueService.updateIssue(subId, { status: newStatus });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const currentSubs = issue.subtasks || [];
    const newSubKey = `${issue.key}-${currentSubs.length + 1}`;

    const createdSubIssue = issueService.createIssue({
      projectId: issue.projectId,
      sprintId: issue.sprintId,
      epicId: issue.epicId,
      parentIssueId: issue.id,
      title: newSubtaskTitle.trim(),
      description: `Subtask of ${issue.key}: ${issue.title}`,
      type: 'SUBTASK',
      status: 'TODO',
      priority: issue.priority,
      storyPoints: undefined,
      reporterId: currentUser.id,
      assigneeId: issue.assigneeId,
      labels: issue.labels || [],
      subtasks: [],
      customKey: newSubKey,
    });

    const newSt = {
      id: createdSubIssue.id,
      key: newSubKey,
      title: newSubtaskTitle.trim(),
      completed: false,
      status: 'TODO' as IssueStatus,
      assigneeId: issue.assigneeId,
    };

    issueService.updateIssue(issue.id, {
      subtasks: [...currentSubs, newSt],
    });

    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
  };

  const handleSaveEditSubtask = (subId: string) => {
    if (!editingSubtaskTitle.trim()) return;
    const updated = (issue.subtasks || []).map((st) =>
      st.id === subId ? { ...st, title: editingSubtaskTitle.trim() } : st
    );
    issueService.updateIssue(issue.id, { subtasks: updated });
    issueService.updateIssue(subId, { title: editingSubtaskTitle.trim() });
    setEditingSubtaskId(null);
  };

  const handleAssignSubtask = (subId: string, newAssigneeId?: string) => {
    const updated = (issue.subtasks || []).map((st) =>
      st.id === subId ? { ...st, assigneeId: newAssigneeId } : st
    );
    issueService.updateIssue(issue.id, { subtasks: updated });
    issueService.updateIssue(subId, { assigneeId: newAssigneeId });
    setActiveMenuSubtaskId(null);
    setSubtaskMenuSubmenu(null);
  };

  const handleChangeSubtaskStatus = (subId: string, newStatus: IssueStatus) => {
    const isCompleted = newStatus === 'DONE';
    const updated = (issue.subtasks || []).map((st) =>
      st.id === subId ? { ...st, status: newStatus, completed: isCompleted } : st
    );
    issueService.updateIssue(issue.id, { subtasks: updated });
    issueService.updateIssue(subId, { status: newStatus });
    setActiveMenuSubtaskId(null);
    setSubtaskMenuSubmenu(null);
  };

  const handleDeleteSubtask = (subId: string) => {
    if (!userCanDelete) {
      alert('You do not have permission to delete subtasks.');
      return;
    }
    const updated = (issue.subtasks || []).filter((st) => st.id !== subId && st.key !== subId);
    issueService.updateIssue(issue.id, { subtasks: updated });
    issueService.deleteIssue(subId);
    setActiveMenuSubtaskId(null);
  };

  const renderCompactStatus = (status?: IssueStatus, completed?: boolean) => {
    const st = status || (completed ? 'DONE' : 'TODO');
    if (st === 'DONE') {
      return (
        <span
          style={{
            backgroundColor: 'rgba(33, 110, 78, 0.35)',
            color: '#4BCE97',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '3px',
            letterSpacing: '0.02em',
            display: 'inline-block',
            whiteSpace: 'nowrap',
          }}
        >
          Done
        </span>
      );
    }
    if (st === 'IN_PROGRESS' || st === 'IN_REVIEW') {
      return (
        <span
          style={{
            backgroundColor: 'rgba(0, 85, 204, 0.35)',
            color: '#579DFF',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '3px',
            letterSpacing: '0.02em',
            display: 'inline-block',
            whiteSpace: 'nowrap',
          }}
        >
          In Progress
        </span>
      );
    }
    return (
      <span
        style={{
          backgroundColor: '#282E33',
          color: '#DEE4EA',
          fontSize: '11px',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '3px',
          letterSpacing: '0.02em',
          display: 'inline-block',
          whiteSpace: 'nowrap',
        }}
      >
        To Do
      </span>
    );
  };

  const handleRemoveLabel = (lbl: string) => {
    const updated = (issue.labels || []).filter((l) => l !== lbl);
    issueService.updateIssue(issue.id, { labels: updated });
  };

  const handleAddLabel = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && labelInput.trim()) {
      e.preventDefault();
      const val = labelInput.trim().toLowerCase();
      if (!(issue.labels || []).includes(val)) {
        issueService.updateIssue(issue.id, {
          labels: [...(issue.labels || []), val],
        });
      }
      setLabelInput('');
      setIsAddingLabel(false);
    }
  };

  const handleRunAIAnalysis = async () => {
    if (issue.type !== 'STORY' && issue.type !== 'SUBTASK') return;
    setIsAnalyzing(true);
    try {
      await issueService.classifyIssueWithAI(issue.id);
    } catch (err) {
      console.error('Failed to run AI analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyAISuggestions = () => {
    if (!issue.aiClassification) return;
    const { suggestedLabels } = issue.aiClassification;
    const currentLabels = issue.labels || [];
    const combined = Array.from(new Set([...currentLabels, ...(suggestedLabels || [])]));
    issueService.updateIssue(issue.id, { labels: combined });
    setAiAppliedNotification(`Applied suggestions: Added ${suggestedLabels?.length || 0} AI tags.`);
    setTimeout(() => setAiAppliedNotification(null), 3500);
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetIssueKey) return;
    const target = projectIssues.find((i) => i.key === targetIssueKey);
    const newLink: LinkedIssue = {
      id: `link-${Date.now()}`,
      relationship: linkType,
      targetIssueId: target?.id || targetIssueKey,
      targetIssueKey: targetIssueKey,
      targetIssueTitle: target?.title || 'Linked issue',
    };
    const currentLinks = issue.linkedIssues || [];
    issueService.updateIssue(issue.id, {
      linkedIssues: [...currentLinks, newLink],
    });
    setTargetIssueKey('');
    setIsLinkingIssue(false);
  };

  const handleRemoveLink = (linkId: string) => {
    const currentLinks = issue.linkedIssues || [];
    issueService.updateIssue(issue.id, {
      linkedIssues: currentLinks.filter((l) => l.id !== linkId),
    });
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newAttachment: IssueAttachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      url: '#',
      uploadedBy: currentUser.id,
      uploadedAt: new Date().toISOString(),
    };
    const existing = issue.attachments || [];
    issueService.updateIssue(issue.id, {
      attachments: [...existing, newAttachment],
    });
    e.target.value = '';
  };

  const handleRemoveAttachment = (attId: string) => {
    const existing = issue.attachments || [];
    issueService.updateIssue(issue.id, {
      attachments: existing.filter((a) => a.id !== attId),
    });
  };

  const completedSubtasksCount = (issue.subtasks || []).filter((s) => s.completed).length;
  const totalSubtasksCount = (issue.subtasks || []).length;
  const subtaskProgress = totalSubtasksCount > 0 ? (completedSubtasksCount / totalSubtasksCount) * 100 : 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-slide-down"
        style={{
          width: '100%',
          maxWidth: '1080px',
          height: 'calc(100vh - 40px)',
          backgroundColor: '#22272B',
          borderRadius: '6px',
          border: '1px solid #333C48',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.8), 0 0 1px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            height: '52px',
            padding: '0 24px',
            borderBottom: '1px solid #333C48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#1D2125',
          }}
        >
          {/* Breadcrumb info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <IssueTypeIcon type={issue.type} size={18} />
            {issue.type === 'SUBTASK' && parentIssue ? (
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#9FADBC', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {project?.name || 'Project'} /{' '}
                <button
                  type="button"
                  onClick={() =>
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set('issue', parentIssue.key);
                      return next;
                    })
                  }
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#579DFF',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  title={`Go to parent: ${parentIssue.key}`}
                >
                  {parentIssue.key}
                </button>
                {' '}/ {issue.key}
              </span>
            ) : (
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#9FADBC' }}>
                {project?.name || 'Project'} / {issue.key}
              </span>
            )}
            <span
              style={{
                backgroundColor:
                  issue.type === 'EPIC'
                    ? 'rgba(135, 119, 217, 0.25)'
                    : issue.type === 'STORY'
                    ? 'rgba(75, 206, 151, 0.2)'
                    : issue.type === 'BUG'
                    ? 'rgba(248, 113, 113, 0.2)'
                    : 'rgba(87, 157, 255, 0.2)',
                color:
                  issue.type === 'EPIC'
                    ? '#B8ACF6'
                    : issue.type === 'STORY'
                    ? '#4BCE97'
                    : issue.type === 'BUG'
                    ? '#F87171'
                    : '#579DFF',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '3px',
                marginLeft: '4px',
                letterSpacing: '0.04em',
              }}
            >
              {issue.type === 'STORY' ? 'USER STORY' : issue.type}
            </span>

            {/* Quick jump to Parent Epic if attached */}
            {parentEpic && (
              <button
                type="button"
                onClick={() =>
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set('issue', parentEpic.key);
                    return next;
                  })
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(135, 119, 217, 0.15)',
                  border: '1px solid rgba(135, 119, 217, 0.35)',
                  color: '#B8ACF6',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  marginLeft: '8px',
                }}
                title={`Click to view Epic: ${parentEpic.title}`}
              >
                <span>⚡ Epic: {parentEpic.key}</span>
                <ExternalLink size={11} />
              </button>
            )}

            {/* Quick jump to Parent Issue if viewing a Subtask */}
            {parentIssue && (
              <button
                type="button"
                onClick={() =>
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set('issue', parentIssue.key);
                    return next;
                  })
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(87, 157, 255, 0.15)',
                  border: '1px solid rgba(87, 157, 255, 0.35)',
                  color: '#579DFF',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  marginLeft: '8px',
                }}
                title={`Click to view Parent Issue: ${parentIssue.title}`}
              >
                <span>⚡ Parent: {parentIssue.key}</span>
                <ExternalLink size={11} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px',
                borderRadius: '3px',
                cursor: 'pointer',
                color: '#9FADBC',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal 2-Column Split Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* LEFT MAIN CONTENT (65%) */}
          <div
            style={{
              flex: '1 1 65%',
              padding: '24px 32px',
              overflowY: 'auto',
              borderRight: '1px solid #333C48',
            }}
          >
            {/* Title (Click-to-edit) */}
            <div style={{ marginBottom: '20px' }}>
              {isEditingTitle ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSubmit();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                    autoFocus
                    style={{
                      flex: 1,
                      fontSize: '20px',
                      fontWeight: 600,
                      backgroundColor: '#1D2125',
                      color: '#F1F2F4',
                      padding: '6px 10px',
                      border: '2px solid #579DFF',
                      borderRadius: '4px',
                      outline: 'none',
                    }}
                  />
                  <Button appearance="primary" spacing="compact" onClick={handleTitleSubmit}>
                    Save
                  </Button>
                  <Button appearance="subtle" spacing="compact" onClick={() => setIsEditingTitle(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <h1
                  onClick={() => {
                    setTitleValue(issue.title);
                    setIsEditingTitle(true);
                  }}
                  style={{
                    fontSize: '22px',
                    fontWeight: 600,
                    color: '#F1F2F4',
                    lineHeight: 1.3,
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    margin: 0,
                  }}
                  title="Click to edit summary"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {issue.title}
                </h1>
              )}
            </div>

            {/* Parent Epic Context & Sibling Stories (When viewing a Story) */}
            {parentEpic && (
              <div
                style={{
                  backgroundColor: 'rgba(135, 119, 217, 0.08)',
                  border: '1px solid rgba(135, 119, 217, 0.25)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#8777D9', textTransform: 'uppercase' }}>
                      ⚡ Parent Epic:
                    </span>
                    <button
                      onClick={() => setSearchParams({ issue: parentEpic.key })}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#579DFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {parentEpic.key}: {parentEpic.title}
                      <ExternalLink size={12} />
                    </button>
                  </div>
                  <span style={{ fontSize: '12px', color: '#9FADBC' }}>
                    {siblingStories.length + 1} stories in this Epic
                  </span>
                </div>

                {siblingStories.length > 0 && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(135, 119, 217, 0.15)' }}>
                    <div style={{ fontSize: '11px', color: '#8C9BAB', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>
                      Sibling Stories in this Epic:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {siblingStories.map((sib) => (
                        <button
                          key={sib.id}
                          onClick={() => setSearchParams({ issue: sib.key })}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#22272B',
                            border: '1px solid #333C48',
                            borderRadius: '3px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#F1F2F4',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#22272B')}
                        >
                          <IssueTypeIcon type={sib.type} size={13} />
                          <strong style={{ color: '#579DFF' }}>{sib.key}</strong>
                          <span style={{ color: '#9FADBC', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sib.title}
                          </span>
                          <Lozenge status={sib.status} isCompact />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Parent Issue Context (When viewing a Subtask) */}
            {issue.type === 'SUBTASK' && parentIssue && (
              <div
                style={{
                  backgroundColor: 'rgba(87, 157, 255, 0.08)',
                  border: '1px solid rgba(87, 157, 255, 0.25)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#579DFF', textTransform: 'uppercase' }}>
                      ⚡ Parent Issue:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSearchParams((prev) => {
                          const next = new URLSearchParams(prev);
                          next.set('issue', parentIssue.key);
                          return next;
                        })
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#579DFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {parentIssue.key}: {parentIssue.title}
                      <ExternalLink size={12} />
                    </button>
                  </div>
                  <Lozenge status={parentIssue.status} isCompact />
                </div>
              </div>
            )}

            {/* Child Stories in this Epic (When viewing an Epic) */}
            {isEpic && (
              <div
                style={{
                  backgroundColor: '#1D2125',
                  border: '1px solid #333C48',
                  borderRadius: '6px',
                  padding: '16px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={16} color="#8777D9" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#F1F2F4', textTransform: 'uppercase' }}>
                      User Stories in this Epic ({childIssues.length})
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#9FADBC' }}>
                    {childIssues.filter((c) => c.status === 'DONE').length}/{childIssues.length} Done
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: '6px', backgroundColor: '#333C48', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${childIssues.length > 0 ? (childIssues.filter((c) => c.status === 'DONE').length / childIssues.length) * 100 : 0}%`,
                      backgroundColor: '#36B37E',
                      borderRadius: '3px',
                    }}
                  />
                </div>

                {childIssues.length === 0 ? (
                  <div style={{ color: '#738496', fontSize: '13px', fontStyle: 'italic', padding: '8px 0' }}>
                    No child user stories linked to this epic yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {childIssues.map((ci) => {
                      const ciAssignee = users.find((u) => u.id === ci.assigneeId);
                      return (
                        <div
                          key={ci.id}
                          onClick={() => setSearchParams({ issue: ci.key })}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            backgroundColor: '#22272B',
                            border: '1px solid #282E33',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'background-color 0.12s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#22272B')}
                        >
                          <IssueTypeIcon type={ci.type} size={15} />
                          <strong style={{ color: '#579DFF', width: '80px', fontSize: '13px' }}>{ci.key}</strong>
                          <span style={{ flex: 1, color: '#F1F2F4', fontSize: '13px' }}>{ci.title}</span>
                          <Lozenge status={ci.status} isCompact />
                          {ci.storyPoints !== undefined && (
                            <span style={{ fontSize: '11px', color: '#9FADBC', backgroundColor: '#1D2125', padding: '2px 6px', borderRadius: '10px' }}>
                              {ci.storyPoints} pts
                            </span>
                          )}
                          {ciAssignee && (
                            <Avatar name={ciAssignee.name} src={ciAssignee.avatarUrl} size="xsmall" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Description (Click-to-edit) */}
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#8C9BAB',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '8px',
                }}
              >
                Description
              </div>
              {isEditingDesc ? (
                <div>
                  <textarea
                    value={descValue}
                    onChange={(e) => setDescValue(e.target.value)}
                    rows={6}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      backgroundColor: '#1D2125',
                      color: '#F1F2F4',
                      border: '2px solid #579DFF',
                      borderRadius: '4px',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <Button appearance="primary" spacing="compact" onClick={handleDescSubmit}>
                      Save
                    </Button>
                    <Button appearance="subtle" spacing="compact" onClick={() => setIsEditingDesc(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setDescValue(issue.description || '');
                    setIsEditingDesc(true);
                  }}
                  style={{
                    minHeight: '60px',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: issue.description ? '#F1F2F4' : '#738496',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    border: '1px solid transparent',
                  }}
                  title="Click to edit description"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#282E33';
                    e.currentTarget.style.borderColor = '#333C48';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  {issue.description || 'Add a description...'}
                </div>
              )}
            </div>

            {/* AI Classification & Suggestions Panel (Stories & Subtasks only, not for Epics) */}
            {(issue.type === 'STORY' || issue.type === 'SUBTASK') && (
              <div
                style={{
                  backgroundColor: 'rgba(130, 112, 219, 0.12)',
                  border: '1px solid rgba(130, 112, 219, 0.3)',
                  borderRadius: '6px',
                  padding: '16px',
                  marginBottom: '28px',
                }}
              >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#C084FC" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#C084FC' }}>
                    AI Classification & Suggestions
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleRunAIAnalysis}
                    disabled={isAnalyzing}
                    style={{
                      background: '#1D2125',
                      border: '1px solid rgba(130, 112, 219, 0.4)',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#C084FC',
                      cursor: 'pointer',
                    }}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Re-run Analysis'}
                  </button>
                  {issue.aiClassification && (
                    <button
                      onClick={handleApplyAISuggestions}
                      style={{
                        background: '#8270DB',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Check size={13} />
                      Apply Suggestions
                    </button>
                  )}
                </div>
              </div>

              {aiAppliedNotification && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(54, 179, 126, 0.2)',
                    border: '1px solid #36B37E',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#36B37E',
                  }}
                >
                  {aiAppliedNotification}
                </div>
              )}

              {issue.aiClassification ? (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        backgroundColor: '#8270DB',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '3px',
                      }}
                    >
                      {issue.aiClassification.category}
                    </span>
                    <span style={{ fontSize: '12px', color: '#9FADBC' }}>
                      Confidence:{' '}
                      <strong style={{ color: '#F1F2F4' }}>
                        {Math.round(issue.aiClassification.confidence * 100)}%
                      </strong>
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#F1F2F4', marginTop: '8px', lineHeight: 1.5 }}>
                    {issue.aiClassification.summaryInsight}
                  </p>
                  {issue.aiClassification.suggestedLabels && issue.aiClassification.suggestedLabels.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#9FADBC' }}>Suggested Tags:</span>
                      {issue.aiClassification.suggestedLabels.map((lbl) => (
                        <span
                          key={lbl}
                          style={{
                            fontSize: '11px',
                            backgroundColor: 'rgba(130, 112, 219, 0.25)',
                            color: '#D8B4FE',
                            padding: '2px 6px',
                            borderRadius: '3px',
                          }}
                        >
                          #{lbl}
                        </span>
                      ))}
                    </div>
                  )}
                  <span style={{ fontSize: '11px', color: '#8C9BAB', display: 'block', marginTop: '8px' }}>
                    * AI suggestions require user explicit approval. Changes are never auto-committed.
                  </span>
                </div>
              ) : (
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#8C9BAB' }}>
                  Click "Re-run Analysis" to evaluate semantic tokens and suggest issue category and labels.
                </div>
              )}
            </div>
            )}

            {/* Subtasks Section */}
            {issue.type !== 'SUBTASK' && (
              <div style={{ marginBottom: '28px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#8C9BAB',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Subtasks ({completedSubtasksCount}/{totalSubtasksCount})
                  </div>
                  {totalSubtasksCount > 0 && (
                    <div
                      style={{
                        width: '80px',
                        height: '6px',
                        backgroundColor: '#333C48',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${subtaskProgress}%`,
                          height: '100%',
                          backgroundColor: '#36B37E',
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingSubtask(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#579DFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} /> Add subtask
                </button>
              </div>

              {totalSubtasksCount === 0 && !isAddingSubtask ? (
                <div style={{ fontSize: '13px', color: '#738496', fontStyle: 'italic' }}>
                  No subtasks yet. Break this issue down into smaller work items.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(issue.subtasks || []).map((sub) => {
                    const isCompleted = sub.completed || sub.status === 'DONE';
                    return (
                      <div
                        key={sub.id}
                        onClick={() => {
                          if (editingSubtaskId !== sub.id) {
                            setSearchParams((prev) => {
                              const next = new URLSearchParams(prev);
                              next.set('issue', sub.key);
                              return next;
                            });
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          backgroundColor: '#1D2125',
                          border: '1px solid #282E33',
                          position: 'relative',
                          transition: 'background-color 0.1s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#22272B')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1D2125')}
                      >
                        {/* Checkbox for quick Done/To Do toggle */}
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => handleToggleSubtask(sub.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px',
                            accentColor: '#579DFF',
                            flexShrink: 0,
                          }}
                        />

                        {/* Subtask Key (Clickable: opens subtask detail) */}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchParams((prev) => {
                              const next = new URLSearchParams(prev);
                              next.set('issue', sub.key);
                              return next;
                            });
                          }}
                          style={{
                            fontSize: '12px',
                            color: '#579DFF',
                            fontWeight: 600,
                            width: '85px',
                            flexShrink: 0,
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                          title="Open subtask details"
                        >
                          {sub.key}
                        </span>

                        {/* Subtask Title (Clickable: opens subtask detail or inline edit) */}
                        {editingSubtaskId === sub.id ? (
                          <div
                            style={{ flex: 1, display: 'flex', gap: '6px', alignItems: 'center' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              value={editingSubtaskTitle}
                              onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditSubtask(sub.id);
                                if (e.key === 'Escape') setEditingSubtaskId(null);
                              }}
                              autoFocus
                              style={{
                                flex: 1,
                                padding: '4px 8px',
                                fontSize: '13px',
                                backgroundColor: '#161A1D',
                                color: '#F1F2F4',
                                border: '1px solid #579DFF',
                                borderRadius: '3px',
                                outline: 'none',
                              }}
                            />
                            <Button appearance="primary" spacing="compact" onClick={() => handleSaveEditSubtask(sub.id)}>
                              Save
                            </Button>
                            <Button appearance="subtle" spacing="compact" onClick={() => setEditingSubtaskId(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchParams((prev) => {
                                const next = new URLSearchParams(prev);
                                next.set('issue', sub.key);
                                return next;
                              });
                            }}
                            style={{
                              flex: 1,
                              fontSize: '13px',
                              color: isCompleted ? '#738496' : '#F1F2F4',
                              textDecoration: isCompleted ? 'line-through' : 'none',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title="Open subtask details"
                          >
                            {sub.title}
                          </span>
                        )}

                        {/* Compact Status Indicator (Done / In Progress / To Do) */}
                        <div
                          style={{ flexShrink: 0, marginRight: '4px' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {renderCompactStatus(sub.status, sub.completed)}
                        </div>

                        {/* ⋯ Menu Button */}
                        <div style={{ position: 'relative', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuSubtaskId(activeMenuSubtaskId === sub.id ? null : sub.id);
                              setSubtaskMenuSubmenu(null);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#9FADBC',
                              cursor: 'pointer',
                              padding: '4px 6px',
                              borderRadius: '3px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="More options"
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333C48')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <MoreHorizontal size={15} />
                          </button>

                          {/* ⋯ Menu Popover */}
                          {activeMenuSubtaskId === sub.id && (
                            <>
                              <div
                                style={{
                                  position: 'fixed',
                                  inset: 0,
                                  zIndex: 55,
                                  background: 'transparent',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuSubtaskId(null);
                                  setSubtaskMenuSubmenu(null);
                                }}
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  right: 0,
                                  top: '100%',
                                  marginTop: '4px',
                                  backgroundColor: '#22272B',
                                  border: '1px solid #333C48',
                                  borderRadius: '4px',
                                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
                                  padding: '4px',
                                  zIndex: 60,
                                  minWidth: '150px',
                                }}
                              >
                                {/* Edit */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSubtaskId(sub.id);
                                    setEditingSubtaskTitle(sub.title);
                                    setActiveMenuSubtaskId(null);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    width: '100%',
                                    padding: '6px 10px',
                                    background: 'none',
                                    border: 'none',
                                    borderRadius: '3px',
                                    color: '#F1F2F4',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  <Edit2 size={13} color="#9FADBC" />
                                  <span>Edit</span>
                                </button>

                                {/* Assign */}
                                <div style={{ position: 'relative' }}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSubtaskMenuSubmenu(subtaskMenuSubmenu === 'assign' ? null : 'assign')
                                    }
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '8px',
                                      width: '100%',
                                      padding: '6px 10px',
                                      background: 'none',
                                      border: 'none',
                                      borderRadius: '3px',
                                      color: '#F1F2F4',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <UserIcon size={13} color="#9FADBC" />
                                      <span>Assign</span>
                                    </div>
                                    <ChevronRight size={12} color="#9FADBC" />
                                  </button>

                                  {subtaskMenuSubmenu === 'assign' && (
                                    <div
                                      style={{
                                        position: 'absolute',
                                        right: '100%',
                                        top: 0,
                                        marginRight: '4px',
                                        backgroundColor: '#22272B',
                                        border: '1px solid #333C48',
                                        borderRadius: '4px',
                                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6)',
                                        padding: '4px',
                                        zIndex: 70,
                                        minWidth: '160px',
                                        maxHeight: '180px',
                                        overflowY: 'auto',
                                      }}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => handleAssignSubtask(sub.id, undefined)}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          width: '100%',
                                          padding: '5px 8px',
                                          background: 'none',
                                          border: 'none',
                                          borderRadius: '3px',
                                          color: '#9FADBC',
                                          fontSize: '12px',
                                          cursor: 'pointer',
                                          textAlign: 'left',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                      >
                                        Unassigned
                                      </button>
                                      {users.map((u) => (
                                        <button
                                          key={u.id}
                                          type="button"
                                          onClick={() => handleAssignSubtask(sub.id, u.id)}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            width: '100%',
                                            padding: '5px 8px',
                                            background: 'none',
                                            border: 'none',
                                            borderRadius: '3px',
                                            color: '#F1F2F4',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                          }}
                                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                        >
                                          <Avatar name={u.name} src={u.avatarUrl} size="xsmall" />
                                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {u.name}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Change status */}
                                <div style={{ position: 'relative' }}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSubtaskMenuSubmenu(subtaskMenuSubmenu === 'status' ? null : 'status')
                                    }
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '8px',
                                      width: '100%',
                                      padding: '6px 10px',
                                      background: 'none',
                                      border: 'none',
                                      borderRadius: '3px',
                                      color: '#F1F2F4',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <Activity size={13} color="#9FADBC" />
                                      <span>Change status</span>
                                    </div>
                                    <ChevronRight size={12} color="#9FADBC" />
                                  </button>

                                  {subtaskMenuSubmenu === 'status' && (
                                    <div
                                      style={{
                                        position: 'absolute',
                                        right: '100%',
                                        top: 0,
                                        marginRight: '4px',
                                        backgroundColor: '#22272B',
                                        border: '1px solid #333C48',
                                        borderRadius: '4px',
                                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6)',
                                        padding: '4px',
                                        zIndex: 70,
                                        minWidth: '120px',
                                      }}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => handleChangeSubtaskStatus(sub.id, 'TODO')}
                                        style={{
                                          display: 'block',
                                          width: '100%',
                                          padding: '5px 8px',
                                          background: 'none',
                                          border: 'none',
                                          borderRadius: '3px',
                                          color: '#DEE4EA',
                                          fontSize: '12px',
                                          cursor: 'pointer',
                                          textAlign: 'left',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                      >
                                        To Do
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleChangeSubtaskStatus(sub.id, 'IN_PROGRESS')}
                                        style={{
                                          display: 'block',
                                          width: '100%',
                                          padding: '5px 8px',
                                          background: 'none',
                                          border: 'none',
                                          borderRadius: '3px',
                                          color: '#579DFF',
                                          fontSize: '12px',
                                          cursor: 'pointer',
                                          textAlign: 'left',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                      >
                                        In Progress
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleChangeSubtaskStatus(sub.id, 'DONE')}
                                        style={{
                                          display: 'block',
                                          width: '100%',
                                          padding: '5px 8px',
                                          background: 'none',
                                          border: 'none',
                                          borderRadius: '3px',
                                          color: '#4BCE97',
                                          fontSize: '12px',
                                          cursor: 'pointer',
                                          textAlign: 'left',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#282E33')}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                      >
                                        Done
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <div style={{ height: '1px', backgroundColor: '#333C48', margin: '4px 0' }} />

                                {/* Delete */}
                                <button
                                  type="button"
                                  disabled={!userCanDelete}
                                  onClick={() => handleDeleteSubtask(sub.id)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    width: '100%',
                                    padding: '6px 10px',
                                    background: 'none',
                                    border: 'none',
                                    borderRadius: '3px',
                                    color: userCanDelete ? '#F87171' : '#6B778C',
                                    fontSize: '12px',
                                    cursor: userCanDelete ? 'pointer' : 'not-allowed',
                                    textAlign: 'left',
                                  }}
                                  title={!userCanDelete ? 'Only Admin or Team Lead can delete' : undefined}
                                  onMouseEnter={(e) => {
                                    if (userCanDelete) e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.15)';
                                  }}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  <Trash2 size={13} color={userCanDelete ? '#F87171' : '#6B778C'} />
                                  <span>Delete {!userCanDelete && '(Restricted)'}</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Inline Subtask Creation: [What needs to be done?] [Add] [Cancel] */}
              {isAddingSubtask && (
                <form onSubmit={handleAddSubtask} style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                  <input
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    autoFocus
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      fontSize: '13px',
                      backgroundColor: '#1D2125',
                      color: '#F1F2F4',
                      border: '1px solid #579DFF',
                      borderRadius: '3px',
                      outline: 'none',
                    }}
                  />
                  <Button appearance="primary" spacing="compact" type="submit" disabled={!newSubtaskTitle.trim()}>
                    Add
                  </Button>
                  <Button appearance="subtle" spacing="compact" onClick={() => setIsAddingSubtask(false)}>
                    Cancel
                  </Button>
                </form>
              )}
            </div>
            )}

            {/* Linked Issues Section */}
            <div style={{ marginBottom: '28px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#8C9BAB',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Link2 size={14} /> Linked Issues ({(issue.linkedIssues || []).length})
                </div>
                <button
                  onClick={() => setIsLinkingIssue(!isLinkingIssue)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#579DFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} /> Link issue
                </button>
              </div>

              {isLinkingIssue && (
                <form
                  onSubmit={handleAddLink}
                  style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '10px',
                    backgroundColor: '#1D2125',
                    borderRadius: '4px',
                    border: '1px solid #333C48',
                    marginBottom: '10px',
                  }}
                >
                  <select
                    value={linkType}
                    onChange={(e) => setLinkType(e.target.value as LinkRelationship)}
                    style={{
                      backgroundColor: '#22272B',
                      color: '#F1F2F4',
                      border: '1px solid #333C48',
                      borderRadius: '3px',
                      padding: '6px 8px',
                      fontSize: '12px',
                    }}
                  >
                    <option value="relates to">relates to</option>
                    <option value="blocks">blocks</option>
                    <option value="is blocked by">is blocked by</option>
                    <option value="duplicates">duplicates</option>
                    <option value="is duplicated by">is duplicated by</option>
                  </select>

                  <select
                    value={targetIssueKey}
                    onChange={(e) => setTargetIssueKey(e.target.value)}
                    style={{
                      flex: 1,
                      backgroundColor: '#22272B',
                      color: '#F1F2F4',
                      border: '1px solid #333C48',
                      borderRadius: '3px',
                      padding: '6px 8px',
                      fontSize: '12px',
                    }}
                  >
                    <option value="">Select target issue...</option>
                    {otherIssues.map((oi) => (
                      <option key={oi.id} value={oi.key}>
                        {oi.key}: {oi.title}
                      </option>
                    ))}
                  </select>

                  <Button appearance="primary" spacing="compact" type="submit" disabled={!targetIssueKey}>
                    Link
                  </Button>
                  <Button appearance="subtle" spacing="compact" onClick={() => setIsLinkingIssue(false)}>
                    Cancel
                  </Button>
                </form>
              )}

              {(issue.linkedIssues || []).length === 0 && !isLinkingIssue ? (
                <div style={{ fontSize: '13px', color: '#738496', fontStyle: 'italic' }}>
                  No linked issues. Link related tasks, dependencies, or blockers.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(issue.linkedIssues || []).map((lnk) => (
                    <div
                      key={lnk.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: '#1D2125',
                        borderRadius: '4px',
                        border: '1px solid #282E33',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            backgroundColor: lnk.relationship === 'blocks' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(87, 157, 255, 0.2)',
                            color: lnk.relationship === 'blocks' ? '#F87171' : '#579DFF',
                            padding: '2px 6px',
                            borderRadius: '3px',
                          }}
                        >
                          {lnk.relationship}
                        </span>
                        <strong style={{ fontSize: '13px', color: '#579DFF' }}>{lnk.targetIssueKey}</strong>
                        <span style={{ fontSize: '13px', color: '#9FADBC' }}>{lnk.targetIssueTitle}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveLink(lnk.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#8C9BAB',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                        title="Remove link"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attachments Section */}
            <div style={{ marginBottom: '28px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#8C9BAB',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Paperclip size={14} /> Attachments ({(issue.attachments || []).length})
                </div>
                <label
                  style={{
                    color: '#579DFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} /> Attach file
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleSimulateUpload}
                  />
                </label>
              </div>

              {(issue.attachments || []).length === 0 ? (
                <div
                  style={{
                    border: '1px dashed #333C48',
                    borderRadius: '4px',
                    padding: '16px',
                    textAlign: 'center',
                    color: '#738496',
                    fontSize: '13px',
                  }}
                >
                  Drag and drop files here, or click "Attach file" above.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                  {(issue.attachments || []).map((att) => (
                    <div
                      key={att.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        backgroundColor: '#1D2125',
                        borderRadius: '4px',
                        border: '1px solid #282E33',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <FileText size={16} color="#579DFF" />
                        <div style={{ overflow: 'hidden' }}>
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#F1F2F4',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                            }}
                            title={att.name}
                          >
                            {att.name}
                          </div>
                          <div style={{ fontSize: '10px', color: '#8C9BAB' }}>
                            {typeof att.size === 'number' ? `${(att.size / 1024).toFixed(1)} KB` : att.size}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveAttachment(att.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#8C9BAB',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                        title="Delete attachment"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity & Comments Tabs */}
            <div>
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  borderBottom: '1px solid #333C48',
                  marginBottom: '16px',
                }}
              >
                <button
                  onClick={() => setActiveTab('comments')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px 4px',
                    fontSize: '13px',
                    fontWeight: activeTab === 'comments' ? 600 : 400,
                    color: activeTab === 'comments' ? '#579DFF' : '#9FADBC',
                    borderBottom: activeTab === 'comments' ? '2px solid #579DFF' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <MessageSquare size={15} /> Comments ({comments.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px 4px',
                    fontSize: '13px',
                    fontWeight: activeTab === 'history' ? 600 : 400,
                    color: activeTab === 'history' ? '#579DFF' : '#9FADBC',
                    borderBottom: activeTab === 'history' ? '2px solid #579DFF' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Clock size={15} /> History
                </button>
              </div>

              {activeTab === 'comments' && (
                <div>
                  {/* New Comment Input Form */}
                  <form onSubmit={handleAddComment} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="small" />
                      <div style={{ flex: 1 }}>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment... (Type markdown or notes)"
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '13px',
                            backgroundColor: '#1D2125',
                            color: '#F1F2F4',
                            border: '1px solid #333C48',
                            borderRadius: '4px',
                            outline: 'none',
                            fontFamily: 'inherit',
                          }}
                        />
                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <Button
                            appearance="primary"
                            spacing="compact"
                            type="submit"
                            disabled={!newComment.trim()}
                          >
                            Save Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>

                  {/* Comments Thread */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {comments.map((comm) => {
                      const author = users.find((u) => u.id === comm.authorId);
                      return (
                        <div key={comm.id} style={{ display: 'flex', gap: '12px' }}>
                          <Avatar name={author?.name || 'User'} src={author?.avatarUrl} size="small" />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#F1F2F4' }}>
                                {author?.name || 'Teammate'}
                              </span>
                              <span style={{ fontSize: '11px', color: '#8C9BAB' }}>
                                {new Date(comm.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: '13px',
                                color: '#F1F2F4',
                                lineHeight: 1.5,
                                backgroundColor: '#1D2125',
                                border: '1px solid #282E33',
                                padding: '8px 12px',
                                borderRadius: '4px',
                              }}
                            >
                              {comm.content}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div style={{ fontSize: '13px', color: '#9FADBC', padding: '12px 0' }}>
                  <div style={{ marginBottom: '8px' }}>
                    • <strong style={{ color: '#F1F2F4' }}>Created</strong> on {new Date(issue.createdAt).toLocaleString()} by {reporter?.name || 'User'}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    • <strong style={{ color: '#F1F2F4' }}>Status</strong> is currently {issue.status}
                  </div>
                  <div>
                    • <strong style={{ color: '#F1F2F4' }}>Last updated</strong> on {new Date(issue.updatedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT METADATA SIDEBAR (35%) */}
          <div
            style={{
              flex: '1 1 35%',
              backgroundColor: '#1D2125',
              padding: '24px 20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Status Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#8C9BAB', marginBottom: '6px' }}>
                STATUS
              </label>
              <Select
                value={issue.status}
                onChange={(e) => handleStatusChange(e.target.value as IssueStatus)}
                style={{ width: '100%' }}
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="QA_TESTING">QA Testing</option>
                <option value="DONE">Done</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
            </div>

            {/* Assignees (Multi-assignee support) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#8C9BAB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Assignees ({assignedUsers.length})
                  {isEpic && !userCanAssign && (
                    <span style={{ color: '#F87171', fontSize: '10px', fontWeight: 'normal', marginLeft: '4px' }}>
                      (Lead/Admin only)
                    </span>
                  )}
                </label>
                {userCanAssign && !currentAssigneeIds.includes(currentUser.id) && (
                  <button
                    type="button"
                    onClick={handleAssignToMe}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#579DFF',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: '3px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(87, 157, 255, 0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    Assign to me
                  </button>
                )}
              </div>

              {/* List of currently assigned users */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                {assignedUsers.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', backgroundColor: '#22272B', borderRadius: '4px', border: '1px dashed #38414A' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#282E33', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8C9BAB', fontSize: '10px' }}>
                      ?
                    </div>
                    <span style={{ fontSize: '12px', color: '#8C9BAB' }}>Unassigned</span>
                  </div>
                ) : (
                  assignedUsers.map((u, index) => (
                    <div
                      key={u.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '5px 8px',
                        backgroundColor: '#22272B',
                        border: '1px solid #333C48',
                        borderRadius: '4px',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                        <Avatar name={u.name} src={u.avatarUrl} size="small" />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#F1F2F4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.name}
                            {index === 0 && assignedUsers.length > 1 && (
                              <span style={{ marginLeft: '6px', fontSize: '9px', fontWeight: 700, padding: '1px 4px', borderRadius: '2px', backgroundColor: 'rgba(87, 157, 255, 0.15)', color: '#579DFF' }}>
                                LEAD
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '10px', color: '#8C9BAB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.title}
                          </div>
                        </div>
                      </div>

                      {userCanAssign && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAssignee(u.id)}
                          title={`Unassign ${u.name}`}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#8C9BAB',
                            cursor: 'pointer',
                            padding: '3px',
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '4px',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.15)';
                            e.currentTarget.style.color = '#F87171';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#8C9BAB';
                          }}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add another assignee selector */}
              {userCanAssign && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleAddAssignee(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      height: '32px',
                      padding: '0 8px',
                      fontSize: '12px',
                      backgroundColor: '#1D2125',
                      border: '1px solid #333C48',
                      borderRadius: '3px',
                      color: '#9FADBC',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="">+ Assign another person...</option>
                    {users
                      .filter((u) => !currentAssigneeIds.includes(u.id))
                      .map((u) => (
                        <option key={u.id} value={u.id} style={{ backgroundColor: '#22272B', color: '#F1F2F4' }}>
                          {u.name} — {u.title} ({u.role})
                        </option>
                      ))}
                  </select>

                  {assignedUsers.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllAssignees}
                      title="Clear all assignees"
                      style={{
                        background: 'transparent',
                        border: '1px solid #38414A',
                        borderRadius: '3px',
                        color: '#8C9BAB',
                        fontSize: '11px',
                        padding: '0 8px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#282E33';
                        e.currentTarget.style.color = '#F87171';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#8C9BAB';
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Reporter */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#8C9BAB', marginBottom: '4px' }}>
                REPORTER
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar name={reporter?.name || 'Reporter'} src={reporter?.avatarUrl} size="xsmall" />
                <span style={{ fontSize: '13px', color: '#F1F2F4' }}>
                  {reporter?.name || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#8C9BAB', marginBottom: '6px' }}>
                PRIORITY
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PriorityIcon priority={issue.priority} size={16} />
                <Select
                  value={issue.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as IssuePriority)}
                  isCompact
                  style={{ flex: 1 }}
                >
                  <option value="HIGHEST">Highest</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                  <option value="LOWEST">Lowest</option>
                </Select>
              </div>
            </div>

            {/* Epic Field / Child Issues List */}
            {isEpic ? (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#8C9BAB', marginBottom: '6px' }}>
                  CHILD ISSUES ({childIssues.length})
                </label>
                {childIssues.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#738496', fontStyle: 'italic' }}>
                    No child issues assigned to this epic yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {childIssues.map((ci) => (
                      <div
                        key={ci.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 6px',
                          backgroundColor: '#22272B',
                          borderRadius: '3px',
                          fontSize: '12px',
                        }}
                      >
                        <IssueTypeIcon type={ci.type} size={14} />
                        <strong style={{ color: '#579DFF' }}>{ci.key}</strong>
                        <span style={{ flex: 1, color: '#9FADBC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ci.title}
                        </span>
                        <Lozenge status={ci.status} isCompact />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#8C9BAB' }}>
                    PARENT EPIC
                  </label>
                  {parentEpic && (
                    <button
                      type="button"
                      onClick={() => setSearchParams({ issue: parentEpic.key })}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#579DFF',
                        fontSize: '11px',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      Open Epic <ExternalLink size={10} />
                    </button>
                  )}
                </div>
                <Select
                  value={issue.epicId || ''}
                  onChange={(e) => issueService.updateIssue(issue.id, { epicId: e.target.value || undefined })}
                  isCompact
                  style={{ width: '100%' }}
                >
                  <option value="">None (No Epic)</option>
                  {epics.map((ep) => (
                    <option key={ep.id} value={ep.id}>
                      ⚡ {ep.key}: {ep.title}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Sprint Field */}
            {!isEpic && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#8C9BAB', marginBottom: '6px' }}>
                  SPRINT
                </label>
                <Select
                  value={issue.sprintId || ''}
                  onChange={(e) => issueService.updateIssue(issue.id, { sprintId: e.target.value || null })}
                  isCompact
                  style={{ width: '100%' }}
                >
                  <option value="">Backlog (No Sprint)</option>
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.status})
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Story Points */}
            {!isEpic && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#8C9BAB', marginBottom: '6px' }}>
                  STORY POINTS
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={issue.storyPoints ?? ''}
                  onChange={(e) =>
                    issueService.updateIssue(issue.id, {
                      storyPoints: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  style={{
                    width: '80px',
                    padding: '6px 8px',
                    fontSize: '13px',
                    backgroundColor: '#22272B',
                    border: '1px solid #333C48',
                    borderRadius: '3px',
                    color: '#F1F2F4',
                  }}
                />
              </div>
            )}

            {/* Due Date Picker */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#8C9BAB', marginBottom: '6px' }}>
                DUE DATE
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="#8C9BAB" />
                <input
                  type="date"
                  value={issue.dueDate || ''}
                  onChange={(e) => issueService.updateIssue(issue.id, { dueDate: e.target.value || undefined })}
                  style={{
                    backgroundColor: '#22272B',
                    border: '1px solid #333C48',
                    borderRadius: '3px',
                    color: '#F1F2F4',
                    padding: '4px 8px',
                    fontSize: '13px',
                    outline: 'none',
                    flex: 1,
                  }}
                />
              </div>
            </div>

            {/* Labels */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#8C9BAB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Labels
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingLabel(!isAddingLabel)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#579DFF',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(87, 157, 255, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {isAddingLabel ? 'Cancel' : '+ Add'}
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', minHeight: '24px' }}>
                {(issue.labels || []).length === 0 && !isAddingLabel && (
                  <span style={{ fontSize: '12px', color: '#738496', fontStyle: 'italic' }}>None</span>
                )}
                {(issue.labels || []).map((lbl) => (
                  <Tag
                    key={lbl}
                    label={lbl}
                    isRemovable
                    onRemove={() => handleRemoveLabel(lbl)}
                    color="blue"
                  />
                ))}
              </div>

              {isAddingLabel && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                  <input
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsAddingLabel(false);
                        setLabelInput('');
                      } else {
                        handleAddLabel(e);
                      }
                    }}
                    placeholder="Type tag & press Enter..."
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      fontSize: '12px',
                      backgroundColor: '#1D2125',
                      border: '1px solid #579DFF',
                      borderRadius: '3px',
                      color: '#F1F2F4',
                      outline: 'none',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Dates info */}
            <div style={{ borderTop: '1px solid #333C48', paddingTop: '16px', fontSize: '11px', color: '#738496' }}>
              <div>Created: {new Date(issue.createdAt).toLocaleDateString()}</div>
              <div style={{ marginTop: '4px' }}>
                Updated: {new Date(issue.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
