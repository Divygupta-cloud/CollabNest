import { Team } from '../types';

export const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Platform Engineering',
    description: 'Core backend microservices, distributed data pipelines, and public API gateway.',
    leadId: 'user-1',
    memberIds: ['user-1', 'user-3', 'user-7', 'user-12'],
    department: 'Core Infrastructure',
    projectIds: ['proj-1', 'proj-4'],
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'team-2',
    name: 'Frontend Experience',
    description: 'Design system components, web portal architecture, and accessibility standards.',
    leadId: 'user-2',
    memberIds: ['user-2', 'user-4', 'user-6', 'user-9'],
    department: 'Product Engineering',
    projectIds: ['proj-1', 'proj-4'],
    createdAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'team-3',
    name: 'Mobile Core',
    description: 'iOS and Android client applications, offline-sync engine, and push notifications.',
    leadId: 'user-8',
    memberIds: ['user-8', 'user-11'],
    department: 'Mobile Engineering',
    projectIds: ['proj-3'],
    createdAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'team-4',
    name: 'DevOps & SRE',
    description: 'Kubernetes fleet orchestration, CI/CD deployment pipelines, and 99.99% availability.',
    leadId: 'user-5',
    memberIds: ['user-5', 'user-10'],
    department: 'Cloud Infrastructure',
    projectIds: ['proj-2'],
    createdAt: '2024-02-12T09:00:00Z',
  },
];
