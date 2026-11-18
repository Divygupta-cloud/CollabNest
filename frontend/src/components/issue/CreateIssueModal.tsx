import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  Link2,
  Quote,
  Table as TableIcon,
  Smile,
  AtSign,
  Calendar,
  Layers,
  SlidersHorizontal,
  Check,
  X,
} from 'lucide-react';
import {
  Modal,
  Button,
  IssueTypeIcon,
  PriorityIcon,
  Avatar,
  Tag,
} from '../../design-system/components';
import {
  useProjects,
  useUsers,
  useSprints,
  useIssues,
  issueService,
  useCurrentUser,
} from '../../services';
import { IssueType, IssuePriority, AIClassification } from '../../types';
import { canCreateEpic, canAssignEpic, getAllowedIssueTypes } from '../../utils/permissions';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultSprintId?: string | null;
  defaultType?: IssueType;
}

const EPIC_COLORS = [
  { name: 'Purple', hex: '#8777D9' },
  { name: 'Deep Purple', hex: '#6554C0' },
  { name: 'Blue', hex: '#0052CC' },
  { name: 'Sky Blue', hex: '#2684FF' },
  { name: 'Teal', hex: '#00B8D9' },
  { name: 'Mint', hex: '#36B37E' },
  { name: 'Green', hex: '#00875A' },
  { name: 'Yellow', hex: '#FFAB00' },
  { name: 'Orange', hex: '#FF7452' },
  { name: 'Red', hex: '#DE350B' },
  { name: 'Pink', hex: '#E182C6' },
  { name: 'Slate', hex: '#505F79' },
];

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId,
  defaultSprintId,
  defaultType = 'STORY',
}) => {
  const projects = useProjects();
  const users = useUsers();
  const currentUser = useCurrentUser();

  const userCanCreateEpic = canCreateEpic(currentUser);
  const userCanAssignEpic = canAssignEpic(currentUser);
  const allowedIssueTypes = getAllowedIssueTypes(currentUser);

  // Safe initial type compliant with user RBAC
  const initialType: IssueType = (() => {
    if (defaultType === 'EPIC' && !userCanCreateEpic) {
      return currentUser.role === 'QA' ? 'BUG' : 'STORY';
    }
    if (currentUser.role === 'QA' && defaultType !== 'BUG' && defaultType !== 'TASK') {
      return 'BUG';
    }
    return defaultType;
  })();

  const [projectId, setProjectId] = useState<string>(
    defaultProjectId || projects[0]?.id || 'proj-1'
  );
  const sprints = useSprints(projectId);
  const projectIssues = useIssues(projectId);
  const epics = useMemo(() => projectIssues.filter((i) => i.type === 'EPIC'), [projectIssues]);

  const [type, setType] = useState<IssueType>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([currentUser.id]);
  const [sprintId, setSprintId] = useState<string>(defaultSprintId || '');
  const [epicId, setEpicId] = useState<string>('');
  const [storyPoints, setStoryPoints] = useState<string>('3');
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>(['frontend', 'ux']);
  const [createAnother, setCreateAnother] = useState(false);

  // Epic-specific fields per Jira standard
  const [epicName, setEpicName] = useState('');
  const [epicColor, setEpicColor] = useState(EPIC_COLORS[0].hex);
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // AI Classification Preview State
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiResult, setAiResult] = useState<{
    category: AIClassification;
    confidence: number;
    suggestedLabels: string[];
    summary: string;
  } | null>(null);

  const isEpic = type === 'EPIC';
  const selectedProject = projects.find((p) => p.id === projectId) || projects[0];

  const handleAddLabel = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && labelInput.trim()) {
      e.preventDefault();
      const val = labelInput.trim().toLowerCase();
      if (!labels.includes(val)) {
        setLabels([...labels, val]);
      }
      setLabelInput('');
    }
  };

  const handleRemoveLabel = (lbl: string) => {
    setLabels(labels.filter((l) => l !== lbl));
  };

  const handleSimulateAI = () => {
    if (!title.trim() || isEpic) return;
    setIsAnalyzingAI(true);
    setTimeout(() => {
      const lower = title.toLowerCase();
      let cat: AIClassification = 'others';
      if (
        lower.includes('fix') ||
        lower.includes('bug') ||
        lower.includes('error') ||
        lower.includes('fail') ||
        lower.includes('crash')
      ) {
        cat = 'Bug';
      } else if (
        lower.includes('doc') ||
        lower.includes('readme') ||
        lower.includes('guide') ||
        lower.includes('manual')
      ) {
        cat = 'docuementation';
      } else if (
        lower.includes('refactor') ||
        lower.includes('clean') ||
        lower.includes('optimize') ||
        lower.includes('perf') ||
        lower.includes('speed')
      ) {
        cat = 'Refactor';
      } else if (
        lower.includes('support') ||
        lower.includes('implement') ||
        lower.includes('add') ||
        lower.includes('oauth') ||
        lower.includes('feature')
      ) {
        cat = 'feature';
      }

      const confidence = parseFloat((0.92 + Math.random() * 0.06).toFixed(2));
      const autoTags = [cat];

      setAiResult({
        category: cat,
        confidence,
        suggestedLabels: autoTags,
        summary: `AI analyzed title semantics: Classified as ${cat} with ${Math.round(confidence * 100)}% confidence score.`,
      });

      // Also adjust type selector if not explicitly an Epic
      if (!isEpic) {
        if (cat === 'Bug') setType('BUG');
        if (cat === 'feature') setType('STORY');
        if (cat === 'docuementation' || cat === 'Refactor' || cat === 'others') setType('TASK');
      }

      setIsAnalyzingAI(false);
    }, 400);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    issueService.createIssue({
      projectId,
      title: title.trim(),
      description: description.trim(),
      type,
      status: 'TODO',
      priority,
      storyPoints: isEpic ? undefined : (parseInt(storyPoints, 10) || undefined),
      reporterId: currentUser.id,
      assigneeId: (isEpic && !userCanAssignEpic) ? undefined : (selectedAssigneeIds[0] || undefined),
      assigneeIds: (isEpic && !userCanAssignEpic) ? [] : selectedAssigneeIds,
      sprintId: isEpic ? null : (sprintId || null),
      epicId: isEpic ? undefined : (epicId || undefined),
      labels: [...labels, ...(isEpic ? ['epic'] : [])],
      subtasks: [],
      aiClassification: (!isEpic && aiResult)
        ? {
            category: aiResult.category,
            confidence: aiResult.confidence,
            suggestedLabels: aiResult.suggestedLabels,
            summaryInsight: aiResult.summary,
            analyzedAt: new Date().toISOString(),
          }
        : undefined,
    });

    if (createAnother) {
      setTitle('');
      setDescription('');
      setEpicName('');
      setEpicId('');
      setAiResult(null);
    } else {
      setTitle('');
      setDescription('');
      setEpicName('');
      setEpicId('');
      setAiResult(null);
      onClose();
    }
  };

  const insertFormat = (prefix: string, suffix = '') => {
    setDescription((prev) => `${prev}${prefix} ${suffix}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="large"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IssueTypeIcon type={type} size={18} />
          <span>{isEpic ? 'Create Epic' : 'Create issue'}</span>
        </div>
      }
      footer={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#9FADBC',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={createAnother}
              onChange={(e) => setCreateAnother(e.target.checked)}
              style={{ accentColor: '#579DFF', cursor: 'pointer' }}
            />
            Create another
          </label>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button appearance="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={() => handleSubmit()}
              disabled={!title.trim()}
            >
              {isEpic ? 'Create Epic' : 'Create'}
            </Button>
          </div>
        </div>
      }
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
      >
        {/* Top Info Notice */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #333C48',
            paddingBottom: '10px',
            fontSize: '12px',
            color: '#8C9BAB',
          }}
        >
          <span>Required fields are marked with an asterisk <span style={{ color: '#F87171' }}>*</span></span>
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: '#9FADBC',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <SlidersHorizontal size={13} />
            Configure fields
          </button>
        </div>

        {/* Project & Issue Type Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#9FADBC',
                marginBottom: '6px',
              }}
            >
              Project <span style={{ color: '#F87171' }}>*</span>
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#22272B',
                border: '1px solid #333C48',
                borderRadius: '3px',
                padding: '0 10px',
                height: '40px',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '3px',
                  backgroundColor: selectedProject?.iconBgColor || '#0C66E4',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '8px',
                  flexShrink: 0,
                }}
              >
                {selectedProject?.key?.slice(0, 2) || 'PR'}
              </div>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '14px',
                  color: '#F1F2F4',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} style={{ backgroundColor: '#22272B', color: '#F1F2F4' }}>
                    {p.name} ({p.key})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#9FADBC',
                marginBottom: '6px',
              }}
            >
              Issue type <span style={{ color: '#F87171' }}>*</span>
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#22272B',
                border: '1px solid #333C48',
                borderRadius: '3px',
                padding: '0 10px',
                height: '40px',
              }}
            >
              <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                <IssueTypeIcon type={type} size={18} />
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as IssueType)}
                style={{
                  flex: 1,
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '14px',
                  color: '#F1F2F4',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {allowedIssueTypes.includes('EPIC') && (
                  <option value="EPIC" style={{ backgroundColor: '#22272B', color: '#F1F2F4' }}>⚡ Epic (Large initiative spanning sprints)</option>
                )}
                {allowedIssueTypes.includes('STORY') && (
                  <option value="STORY" style={{ backgroundColor: '#22272B', color: '#F1F2F4' }}>📗 Story (User feature or deliverable)</option>
                )}
                {allowedIssueTypes.includes('TASK') && (
                  <option value="TASK" style={{ backgroundColor: '#22272B', color: '#F1F2F4' }}>🟦 Task (Technical or chore item)</option>
                )}
                {allowedIssueTypes.includes('BUG') && (
                  <option value="BUG" style={{ backgroundColor: '#22272B', color: '#F1F2F4' }}>🔴 Bug (Problem or error to resolve)</option>
                )}
              </select>
            </div>
            {!userCanCreateEpic && (
              <span style={{ fontSize: '11px', color: '#8C9BAB', marginTop: '4px', display: 'block' }}>
                Note: Epics can only be created by Team Lead or Admin
              </span>
            )}
          </div>
        </div>

        {/* Epic Specific Highlight Banner */}
        {isEpic && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              backgroundColor: 'rgba(135, 119, 217, 0.15)',
              border: '1px solid rgba(135, 119, 217, 0.35)',
              borderRadius: '6px',
              padding: '12px 16px',
            }}
          >
            <div
              style={{
                backgroundColor: '#8777D9',
                color: '#FFFFFF',
                borderRadius: '4px',
                padding: '4px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                flexShrink: 0,
              }}
            >
              <Layers size={13} />
              EPIC
            </div>
            <div style={{ fontSize: '12px', color: '#9FADBC', lineHeight: 1.4 }}>
              An <strong style={{ color: '#F1F2F4' }}>Epic</strong> represents a major objective, feature portfolio, or milestone. Child stories and bugs can be linked to this epic to visualize progress across your Roadmap.
            </div>
          </div>
        )}

        {/* Summary Field */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#9FADBC' }}>
              {isEpic ? 'Epic Summary' : 'Summary'} <span style={{ color: '#F87171' }}>*</span>
            </label>
            {title.trim().length > 3 && !isEpic && (
              <button
                type="button"
                onClick={handleSimulateAI}
                disabled={isAnalyzingAI}
                style={{
                  background: 'rgba(130, 112, 219, 0.2)',
                  border: '1px solid rgba(130, 112, 219, 0.4)',
                  color: '#C084FC',
                  borderRadius: '12px',
                  padding: '2px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Sparkles size={12} color="#C084FC" />
                {isAnalyzingAI ? 'Analyzing...' : 'AI Suggest Tags'}
              </button>
            )}
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              isEpic
                ? 'e.g. Enterprise Single Sign-On (SSO) & Multi-Factor Auth'
                : 'e.g. As a customer, I want to export filtered data to CSV'
            }
            required
            autoFocus
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '14px',
              backgroundColor: '#22272B',
              border: '1px solid #333C48',
              borderRadius: '3px',
              outline: 'none',
              boxSizing: 'border-box',
              color: '#F1F2F4',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#579DFF')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#333C48')}
          />
        </div>

        {/* Epic Specific: Epic Name & Epic Color Picker */}
        {isEpic && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              backgroundColor: '#1D2125',
              border: '1px solid #333C48',
              borderRadius: '6px',
              padding: '14px 16px',
            }}
          >
            {/* Epic Short Name */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#9FADBC',
                  marginBottom: '4px',
                }}
              >
                Epic Name (Label on cards)
              </label>
              <input
                value={epicName}
                onChange={(e) => setEpicName(e.target.value)}
                placeholder="e.g. SSO Integration"
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '13px',
                  backgroundColor: '#22272B',
                  border: '1px solid #333C48',
                  borderRadius: '3px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#F1F2F4',
                }}
              />
              <span style={{ fontSize: '11px', color: '#8C9BAB', marginTop: '3px', display: 'block' }}>
                Short name displayed on child issue badges.
              </span>
            </div>

            {/* Epic Color Swatches */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#9FADBC',
                  marginBottom: '6px',
                }}
              >
                Epic Color
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                {EPIC_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    onClick={() => setEpicColor(c.hex)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      backgroundColor: c.hex,
                      border: epicColor === c.hex ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transform: epicColor === c.hex ? 'scale(1.1)' : 'none',
                      transition: 'transform 0.1s ease',
                      padding: 0,
                    }}
                  >
                    {epicColor === c.hex && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Epic Specific: Roadmap Timeline Dates */}
        {isEpic && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#9FADBC',
                  marginBottom: '4px',
                }}
              >
                <Calendar size={13} />
                Target Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '13px',
                  backgroundColor: '#22272B',
                  border: '1px solid #333C48',
                  borderRadius: '3px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#F1F2F4',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#9FADBC',
                  marginBottom: '4px',
                }}
              >
                <Calendar size={13} />
                Target Due Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '13px',
                  backgroundColor: '#22272B',
                  border: '1px solid #333C48',
                  borderRadius: '3px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#F1F2F4',
                }}
              />
            </div>
          </div>
        )}

        {/* AI Suggestion Insight Pill */}
        {!isEpic && aiResult && (
          <div
            style={{
              backgroundColor: 'rgba(130, 112, 219, 0.15)',
              border: '1px solid rgba(130, 112, 219, 0.35)',
              borderRadius: '6px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="#C084FC" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#F1F2F4' }}>
                  AI Predicted Category:
                </span>
                <span
                  style={{
                    backgroundColor: '#8270DB',
                    color: '#FFFFFF',
                    borderRadius: '3px',
                    padding: '1px 6px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {aiResult.category}
                </span>
                <span style={{ fontSize: '11px', color: '#8C9BAB' }}>
                  ({Math.round(aiResult.confidence * 100)}% confidence)
                </span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#9FADBC' }}>
              {aiResult.summary}
            </p>
          </div>
        )}

        {/* Description Field with Rich Formatting Toolbar */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#9FADBC',
              marginBottom: '6px',
            }}
          >
            Description
          </label>

          <div
            style={{
              border: '1px solid #333C48',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            {/* Formatting Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '6px 8px',
                backgroundColor: '#1D2125',
                borderBottom: '1px solid #333C48',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => insertFormat('**', '**')}
                title="Bold"
                style={{
                  padding: '4px',
                  background: 'none',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Bold size={15} color="#9FADBC" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('*', '*')}
                title="Italic"
                style={{
                  padding: '4px',
                  background: 'none',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Italic size={15} color="#9FADBC" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('`', '`')}
                title="Code"
                style={{
                  padding: '4px',
                  background: 'none',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Code size={15} color="#9FADBC" />
              </button>

              <div
                style={{
                  width: '1px',
                  height: '16px',
                  backgroundColor: '#333C48',
                  margin: '0 4px',
                }}
              />

              <button
                type="button"
                onClick={() => insertFormat('\n- ')}
                title="Bullet list"
                style={{
                  padding: '4px',
                  background: 'none',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <List size={15} color="#9FADBC" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('\n1. ')}
                title="Numbered list"
                style={{
                  padding: '4px',
                  background: 'none',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ListOrdered size={15} color="#9FADBC" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('\n> ')}
                title="Quote"
                style={{
                  padding: '4px',
                  background: 'none',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Quote size={15} color="#9FADBC" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('[link title](', ')')}
                title="Link"
                style={{
                  padding: '4px',
                  background: 'none',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Link2 size={15} color="#9FADBC" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('\n| Column 1 | Column 2 |\n|---|---|\n| Item 1 | Item 2 |\n')}
                title="Table"
                style={{
                  padding: '4px',
                  background: 'none',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <TableIcon size={15} color="#9FADBC" />
              </button>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isEpic
                  ? 'Describe the strategic scope, business value, user personas, and target outcomes of this Epic...'
                  : 'Describe the acceptance criteria, steps to reproduce, or technical requirements...'
              }
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '13px',
                lineHeight: 1.5,
                border: 'none',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                backgroundColor: '#22272B',
                color: '#F1F2F4',
              }}
            />
          </div>
        </div>

        {/* Priority, Assignee & Estimation */}
        <div style={{ display: 'grid', gridTemplateColumns: isEpic ? '1fr 1fr' : '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#9FADBC',
                marginBottom: '6px',
              }}
            >
              Priority
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#22272B',
                border: '1px solid #333C48',
                borderRadius: '3px',
                padding: '0 8px',
                height: '40px',
              }}
            >
              <div style={{ marginRight: '6px' }}>
                <PriorityIcon priority={priority} size={16} />
              </div>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                style={{
                  flex: 1,
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '13px',
                  color: '#F1F2F4',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="HIGHEST" style={{ backgroundColor: '#22272B', color: '#F1F2F4' }}>Highest</option>
                <option value="HIGH" style={{ backgroundColor: '#22272B', color: '#F1F2F4' }}>High</option>
                <option value="MEDIUM" style={{ backgroundColor: '#22272B', color: '#F1F2F4' }}>Medium</option>
                <option value="LOW" style={{ backgroundColor: '#22272B', color: '#F1F2F4' }}>Low</option>
                <option value="LOWEST" style={{ backgroundColor: '#22272B', color: '#F1F2F4' }}>Lowest</option>
              </select>
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '6px',
              }}
            >
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#9FADBC' }}>
                Assignees ({selectedAssigneeIds.length}) {isEpic && !userCanAssignEpic && <span style={{ color: '#F87171', fontSize: '11px' }}>(Lead/Admin only)</span>}
              </label>
              {!selectedAssigneeIds.includes(currentUser.id) && (!isEpic || userCanAssignEpic) && (
                <button
                  type="button"
                  onClick={() => setSelectedAssigneeIds([...selectedAssigneeIds, currentUser.id])}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#579DFF',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Assign to me
                </button>
              )}
            </div>

            {/* Selected Assignees chips */}
            {selectedAssigneeIds.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                {selectedAssigneeIds.map((id) => {
                  const u = users.find((usr) => usr.id === id);
                  if (!u) return null;
                  return (
                    <div
                      key={id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 6px',
                        backgroundColor: '#1E2227',
                        border: '1px solid #333C48',
                        borderRadius: '3px',
                        fontSize: '11px',
                        color: '#F1F2F4',
                      }}
                    >
                      <Avatar name={u.name} src={u.avatarUrl} size="xsmall" />
                      <span>{u.name.split(' ')[0]}</span>
                      {(!isEpic || userCanAssignEpic) && (
                        <button
                          type="button"
                          onClick={() => setSelectedAssigneeIds(selectedAssigneeIds.filter((x) => x !== id))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#8C9BAB',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            marginLeft: '2px',
                          }}
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <select
              value=""
              disabled={isEpic && !userCanAssignEpic}
              onChange={(e) => {
                if (e.target.value && !selectedAssigneeIds.includes(e.target.value)) {
                  setSelectedAssigneeIds([...selectedAssigneeIds, e.target.value]);
                }
              }}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 8px',
                fontSize: '12px',
                backgroundColor: (isEpic && !userCanAssignEpic) ? '#1E2227' : '#22272B',
                border: '1px solid #333C48',
                borderRadius: '3px',
                color: '#9FADBC',
                outline: 'none',
                cursor: (isEpic && !userCanAssignEpic) ? 'not-allowed' : 'pointer',
              }}
            >
              <option value="" style={{ backgroundColor: '#22272B', color: '#8C9BAB' }}>
                + Add an assignee...
              </option>
              {users
                .filter((u) => !selectedAssigneeIds.includes(u.id))
                .map((u) => (
                  <option key={u.id} value={u.id} style={{ backgroundColor: '#22272B', color: '#F1F2F4' }}>
                    {u.name} ({u.title})
                  </option>
                ))}
            </select>
          </div>

          {!isEpic && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#9FADBC',
                  marginBottom: '6px',
                }}
              >
                Story Points
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                placeholder="0"
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 10px',
                  fontSize: '13px',
                  backgroundColor: '#22272B',
                  border: '1px solid #333C48',
                  borderRadius: '3px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#F1F2F4',
                }}
              />
            </div>
          )}
        </div>

        {/* Parent Epic Selector (only for non-Epics) */}
        {!isEpic && epics.length > 0 && (
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#9FADBC',
                marginBottom: '6px',
              }}
            >
              Parent Epic
            </label>
            <select
              value={epicId}
              onChange={(e) => setEpicId(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 10px',
                fontSize: '13px',
                backgroundColor: '#22272B',
                border: '1px solid #333C48',
                borderRadius: '3px',
                outline: 'none',
                color: '#F1F2F4',
              }}
            >
              <option value="" style={{ backgroundColor: '#22272B', color: '#F1F2F4' }}>None (Independent Issue)</option>
              {epics.map((ep) => (
                <option key={ep.id} value={ep.id} style={{ backgroundColor: '#22272B', color: '#F1F2F4' }}>
                  ⚡ {ep.key}: {ep.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sprint selector (only for non-Epics) */}
        {!isEpic && sprints.length > 0 && (
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#9FADBC',
                marginBottom: '6px',
              }}
            >
              Sprint
            </label>
            <select
              value={sprintId}
              onChange={(e) => setSprintId(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 10px',
                fontSize: '13px',
                backgroundColor: '#22272B',
                border: '1px solid #333C48',
                borderRadius: '3px',
                outline: 'none',
                color: '#F1F2F4',
              }}
            >
              <option value="" style={{ backgroundColor: '#22272B', color: '#F1F2F4' }}>Backlog (No Sprint)</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id} style={{ backgroundColor: '#22272B', color: '#F1F2F4' }}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Labels Field */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#9FADBC',
              marginBottom: '6px',
            }}
          >
            Labels
          </label>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              alignItems: 'center',
              padding: '6px 8px',
              border: '1px solid #333C48',
              borderRadius: '3px',
              backgroundColor: '#22272B',
              minHeight: '40px',
            }}
          >
            {labels.map((l) => (
              <Tag key={l} label={l} isRemovable onRemove={() => handleRemoveLabel(l)} />
            ))}

            <input
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={handleAddLabel}
              placeholder={labels.length === 0 ? 'Type a label and press Enter...' : '+ Add label...'}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '12px',
                flex: 1,
                minWidth: '100px',
                padding: '2px 4px',
                backgroundColor: 'transparent',
                color: '#F1F2F4',
              }}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
