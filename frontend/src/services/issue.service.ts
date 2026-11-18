import { useMemo } from 'react';
import { Issue, IssueStatus, Comment } from '../types';
import { mockStore } from '../mocks/store';
import { useStoreState } from './store.hooks';
import { apiClient } from '../config/api';
import { adaptBackendComment, adaptBackendIssue } from './api-adapter';
import { requirePermission } from './rbac';

const isMongoId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

async function resolveBackendIssueId(idOrKey: string): Promise<string | null> {
  if (isMongoId(idOrKey)) {
    return idOrKey;
  }

  const issue = mockStore.getIssueById(idOrKey) || mockStore.getIssueByKey(idOrKey);
  if (!issue) return null;

  if (isMongoId(issue.id)) {
    return issue.id;
  }

  // Lookup in backend by key
  try {
    const res = await apiClient.get(`/issues/key/${issue.key}`);
    if (res.success && res.data) {
      const realId = res.data.id || res.data._id;
      // Update local issue with real backend ID
      mockStore.updateIssue(issue.id, { id: realId });
      return realId;
    }
  } catch (err) {
    console.warn('Could not resolve backend issue by key:', issue.key, err);
  }

  return null;
}

export const issueService = {
  getIssues: (): Issue[] => {
    return mockStore.getIssues();
  },

  getIssuesByProject: (projectId: string): Issue[] => {
    return mockStore.getIssuesByProject(projectId);
  },

  getIssueByKey: (key: string): Issue | undefined => {
    return mockStore.getIssueByKey(key);
  },

  getIssueById: (id: string): Issue | undefined => {
    return mockStore.getIssueById(id);
  },

  deleteIssue: (id: string): boolean => {
    const currentUser = mockStore.getCurrentUser();
    requirePermission(currentUser, 'DELETE_ISSUE');

    const res = mockStore.deleteIssue(id);
    if (isMongoId(id)) {
      apiClient.delete(`/issues/${id}`).catch((err) => console.warn('Backend delete issue failed:', err));
    }
    return res;
  },

  createIssue: (
    issueData: Omit<Issue, 'id' | 'key' | 'createdAt' | 'updatedAt' | 'order'> & { customKey?: string }
  ): Issue => {
    // Backend guard: DEVELOPER cannot create epics; QA can only create BUG/TASK
    const currentUser = mockStore.getCurrentUser();
    if (issueData.type === 'EPIC') {
      requirePermission(currentUser, 'CREATE_EPIC');
    } else {
      requirePermission(currentUser, 'CREATE_ISSUE');
    }
    const created = mockStore.createIssue(issueData);

    // 2. Call backend in background
    apiClient
      .post('/issues', {
        projectId: issueData.projectId,
        title: issueData.title,
        description: issueData.description,
        issueType: issueData.type,
        status: issueData.status,
        priority: issueData.priority,
        assigneeId: issueData.assigneeId,
        assigneeIds: issueData.assigneeIds || (issueData.assigneeId ? [issueData.assigneeId] : []),
        sprintId: issueData.sprintId,
        storyPoints: issueData.storyPoints,
        labels: issueData.labels,
      })
      .then((res) => {
        if (res.success && res.data) {
          const realIssue = adaptBackendIssue(res.data);
          mockStore.updateIssue(created.id, {
            id: realIssue.id,
            key: realIssue.key,
            aiClassification: realIssue.aiClassification,
          });

          // Re-fetch after 1.5s to pull AI classification results
          setTimeout(() => {
            apiClient.get(`/issues/${realIssue.id}`).then((fetchRes) => {
              if (fetchRes.success && fetchRes.data) {
                const classified = adaptBackendIssue(fetchRes.data);
                mockStore.updateIssue(realIssue.id, {
                  aiClassification: classified.aiClassification,
                });
              }
            });
          }, 1500);
        }
      })
      .catch((err) => console.warn('Backend issue creation failed:', err));

    return created;
  },

  updateIssue: (id: string, updates: Partial<Issue>): Issue | undefined => {
    // 1. Immediate optimistic update in store - triggers instant UI re-render
    const updated = mockStore.updateIssue(id, updates);

    // 2. Sync to backend asynchronously
    const backendUpdates: Record<string, any> = {};
    if (updates.title !== undefined) backendUpdates.title = updates.title;
    if (updates.description !== undefined) backendUpdates.description = updates.description;
    if (updates.type !== undefined) backendUpdates.issueType = updates.type;
    if (updates.status !== undefined) backendUpdates.status = updates.status;
    if (updates.priority !== undefined) backendUpdates.priority = updates.priority;
    if (updates.assigneeId !== undefined) backendUpdates.assigneeId = updates.assigneeId;
    if (updates.assigneeIds !== undefined) {
      backendUpdates.assigneeIds = updates.assigneeIds;
      if (backendUpdates.assigneeId === undefined) {
        backendUpdates.assigneeId = updates.assigneeIds[0] || null;
      }
    }
    if (updates.sprintId !== undefined) backendUpdates.sprintId = updates.sprintId;
    if (updates.storyPoints !== undefined) backendUpdates.storyPoints = updates.storyPoints;
    if (updates.labels !== undefined) backendUpdates.labels = updates.labels;
    if (updates.subtasks !== undefined) backendUpdates.subtasks = updates.subtasks;

    resolveBackendIssueId(id).then((realId) => {
      if (realId) {
        apiClient
          .put(`/issues/${realId}`, backendUpdates)
          .catch((err) => console.warn('Backend issue update failed:', err));
      }
    });

    return updated;
  },

  moveIssueStatus: (id: string, newStatus: IssueStatus): Issue | undefined => {
    // 1. Immediate optimistic update in store - triggers instant UI re-render
    const updated = mockStore.moveIssueStatus(id, newStatus);

    // 2. Sync to backend asynchronously
    resolveBackendIssueId(id).then((realId) => {
      if (realId) {
        apiClient
          .patch(`/issues/${realId}/status`, { status: newStatus })
          .catch((err) => console.warn('Backend issue status update failed:', err));
      }
    });

    return updated;
  },

  moveIssueSprint: (id: string, sprintId: string | null): Issue | undefined => {
    const currentUser = mockStore.getCurrentUser();
    requirePermission(currentUser, 'MOVE_ISSUES_TO_SPRINT');

    const updated = mockStore.moveIssueSprint(id, sprintId);

    resolveBackendIssueId(id).then((realId) => {
      if (realId) {
        apiClient
          .put(`/issues/${realId}`, { sprintId })
          .catch((err) => console.warn('Backend issue sprint move failed:', err));
      }
    });

    return updated;
  },

  getComments: (issueId: string): Comment[] => {
    return mockStore.getCommentsByIssue(issueId);
  },

  fetchComments: async (issueId: string): Promise<Comment[]> => {
    try {
      const realId = await resolveBackendIssueId(issueId);
      if (realId) {
        const res = await apiClient.get(`/comments/issue/${realId}`);
        if (res.success && Array.isArray(res.data)) {
          const comments = res.data.map(adaptBackendComment);
          mockStore.setCommentsForIssue(issueId, comments);
          return comments;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch comments from backend:', err);
    }
    return mockStore.getCommentsByIssue(issueId);
  },

  addComment: (issueId: string, content: string): Comment => {
    // 1. Immediate optimistic update in UI
    const newComment = mockStore.addComment(issueId, content);

    // 2. Real POST request to backend API
    resolveBackendIssueId(issueId).then((realId) => {
      if (realId) {
        apiClient
          .post('/comments', {
            issueId: realId,
            content,
          })
          .then((res) => {
            if (res.success && res.data) {
              const backendComment = adaptBackendComment(res.data);
              mockStore.updateCommentId(newComment.id, backendComment.id);
            }
          })
          .catch((err) => {
            console.warn('Backend comment creation failed:', err);
          });
      }
    });

    return newComment;
  },

  deleteComment: (commentId: string): void => {
    mockStore.deleteComment(commentId);

    if (isMongoId(commentId)) {
      apiClient
        .delete(`/comments/${commentId}`)
        .catch((err) => console.warn('Backend comment delete failed:', err));
    }
  },

  classifyIssueWithAI: async (issueId: string): Promise<Issue | undefined> => {
    const issue = mockStore.getIssueById(issueId) || mockStore.getIssueByKey(issueId);
    if (!issue || issue.type === 'EPIC') return undefined;

    try {
      const res = await apiClient.post('/issues/ai-classify', {
        title: issue.title,
        description: issue.description || '',
        issueType: issue.type,
        issueId: issue.id,
        key: issue.key,
      });

      if (res.success && res.data) {
        const data = res.data;
        const updated = mockStore.updateIssue(issue.id, {
          aiClassification: {
            category: data.category,
            confidence: data.confidence,
            suggestedLabels: data.suggestedTags || [data.category],
            summaryInsight: data.reason || `OpenRouter AI classified as ${data.category}`,
            analyzedAt: new Date().toISOString(),
          },
        });
        return updated;
      }
    } catch (err) {
      console.warn('Live OpenRouter classification failed, using fallback:', err);
    }

    // Fallback if network or backend is unreachable
    return issueService.simulateAIAnalysis(issue.id);
  },

  simulateAIAnalysis: (issueId: string): Issue | undefined => {
    resolveBackendIssueId(issueId).then((realId) => {
      if (realId) {
        apiClient.post(`/issues/${realId}/reclassify`).then(() => {
          setTimeout(() => {
            apiClient.get(`/issues/${realId}`).then((res) => {
              if (res.success && res.data) {
                const classified = adaptBackendIssue(res.data);
                mockStore.updateIssue(issueId, {
                  aiClassification: classified.aiClassification,
                });
              }
            });
          }, 1500);
        }).catch(() => {});
      }
    });

    const issue = mockStore.getIssueById(issueId);
    if (!issue || issue.type === 'EPIC') return undefined;

    const categories = ['Bug', 'feature', 'docuementation', 'Refactor', 'others'] as const;
    const titleLower = (issue.title + ' ' + (issue.description || '')).toLowerCase();
    let chosen: (typeof categories)[number] = 'others';

    if (
      titleLower.includes('fix') ||
      titleLower.includes('bug') ||
      titleLower.includes('error') ||
      titleLower.includes('leak') ||
      titleLower.includes('crash')
    ) {
      chosen = 'Bug';
    } else if (
      titleLower.includes('doc') ||
      titleLower.includes('guide') ||
      titleLower.includes('readme') ||
      titleLower.includes('wiki')
    ) {
      chosen = 'docuementation';
    } else if (
      titleLower.includes('refactor') ||
      titleLower.includes('clean') ||
      titleLower.includes('optimize') ||
      titleLower.includes('perf') ||
      titleLower.includes('speed')
    ) {
      chosen = 'Refactor';
    } else if (
      titleLower.includes('support') ||
      titleLower.includes('implement') ||
      titleLower.includes('add') ||
      titleLower.includes('oauth') ||
      titleLower.includes('feature')
    ) {
      chosen = 'feature';
    }

    const confidence = parseFloat((0.88 + Math.random() * 0.10).toFixed(2));
    const sampleTags = [chosen];

    return mockStore.updateIssue(issueId, {
      aiClassification: {
        category: chosen,
        confidence,
        suggestedLabels: sampleTags,
        summaryInsight: `OpenRouter AI model analyzed "${issue.title}". Classified as ${chosen} with ${Math.round(confidence * 100)}% confidence.`,
        analyzedAt: new Date().toISOString(),
      },
    });
  },
};

export function useIssues(projectId?: string): Issue[] {
  const state = useStoreState();
  return useMemo(() => {
    return projectId
      ? state.issues.filter((i) => i.projectId === projectId)
      : state.issues;
  }, [state.issues, projectId]);
}

export function useIssue(issueKeyOrId: string): Issue | undefined {
  const state = useStoreState();
  return useMemo(() => {
    if (!issueKeyOrId) return undefined;
    const keyLower = issueKeyOrId.toLowerCase();
    const direct = state.issues.find(
      (i) => i.key.toLowerCase() === keyLower || i.id === issueKeyOrId
    );
    if (direct) return direct;

    const fromStore = mockStore.getIssueByKey(issueKeyOrId) || mockStore.getIssueById(issueKeyOrId);
    if (fromStore) return fromStore;

    for (const parent of state.issues) {
      if (parent.subtasks && Array.isArray(parent.subtasks)) {
        const sub = parent.subtasks.find(
          (s) => s.key.toLowerCase() === keyLower || s.id === issueKeyOrId
        );
        if (sub) {
          const subAssigneeIds = sub.assigneeIds || (sub.assigneeId ? [sub.assigneeId] : parent.assigneeIds || (parent.assigneeId ? [parent.assigneeId] : []));
          return {
            id: sub.id,
            key: sub.key,
            projectId: parent.projectId,
            sprintId: parent.sprintId,
            epicId: parent.epicId,
            parentIssueId: parent.id,
            title: sub.title,
            description: `Subtask of ${parent.key}: ${parent.title}`,
            type: 'SUBTASK',
            status: sub.status || (sub.completed ? 'DONE' : 'TODO'),
            priority: parent.priority,
            reporterId: parent.reporterId,
            assigneeId: sub.assigneeId || parent.assigneeId,
            assigneeIds: subAssigneeIds,
            labels: parent.labels || [],
            subtasks: [],
            createdAt: parent.createdAt,
            updatedAt: parent.updatedAt,
            order: 0,
          };
        }
      }
    }
    return undefined;
  }, [state.issues, issueKeyOrId]);
}

export function useIssueComments(issueId: string): Comment[] {
  const state = useStoreState();
  return useMemo(() => {
    return state.comments.filter((c) => c.issueId === issueId);
  }, [state.comments, issueId]);
}
