import { Comment } from '../types';

export const mockComments: Comment[] = [
  {
    id: 'comm-1',
    issueId: 'issue-3',
    authorId: 'user-1',
    content: 'Please ensure we support both S256 and plain code challenge methods, although plain should be disabled in production environments for RFC 7636 compliance.',
    createdAt: '2026-09-02T14:30:00Z',
  },
  {
    id: 'comm-2',
    issueId: 'issue-3',
    authorId: 'user-3',
    content: 'Confirmed! S256 is strictly enforced via crypto.subtle in modern browsers with SHA-256 digest validation.',
    createdAt: '2026-09-03T09:15:00Z',
  },
  {
    id: 'comm-3',
    issueId: 'issue-4',
    authorId: 'user-6',
    content: 'I uploaded the updated interactive animation spec for the drag feedback state. Let me know if the drop target shadow looks right on your display.',
    createdAt: '2026-09-04T11:00:00Z',
  },
  {
    id: 'comm-4',
    issueId: 'issue-8',
    authorId: 'user-7',
    content: 'Found the culprit! The webhook handler was holding open transactions during external HTTP retries. Refactoring to release connection before outgoing socket dispatch.',
    createdAt: '2026-09-06T15:45:00Z',
  },
  {
    id: 'comm-5',
    issueId: 'issue-18',
    authorId: 'user-10',
    content: 'Testing Karpenter v0.35 in the staging cluster. Node startup latency dropped from 180s (Cluster Autoscaler) to 42s!',
    createdAt: '2026-09-08T16:00:00Z',
  },
];
