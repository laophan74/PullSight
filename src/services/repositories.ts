import { apiUrl } from './api';
import type { Repository } from '../types';

type RepositoryResponse = {
  id: number;
  name: string;
  owner: string;
  fullName: string;
  description?: string | null;
  language?: string | null;
  visibility: 'public' | 'private';
  openPullRequests: number;
  lastSyncedAt: string;
  defaultBranch: string;
  htmlUrl: string;
};

export async function getRepositories(): Promise<Repository[]> {
  const response = await fetch(apiUrl('/api/repositories'), {
    credentials: 'include',
  });

  if (response.status === 401) {
    throw new Error('Login with GitHub to load your repositories.');
  }

  if (!response.ok) {
    throw new Error('Unable to load repositories from GitHub.');
  }

  const repositories = (await response.json()) as RepositoryResponse[];

  return repositories.map((repository) => ({
    id: repository.id,
    name: repository.name,
    owner: repository.owner,
    fullName: repository.fullName,
    description: repository.description,
    language: repository.language ?? 'Unknown',
    visibility: repository.visibility,
    openPullRequests: repository.openPullRequests,
    lastSyncedAt: formatSyncedAt(repository.lastSyncedAt),
    defaultBranch: repository.defaultBranch,
    htmlUrl: repository.htmlUrl,
  }));
}

function formatSyncedAt(value: string) {
  const syncedAt = new Date(value);
  if (Number.isNaN(syncedAt.getTime())) {
    return 'Just now';
  }

  const seconds = Math.max(0, Math.round((Date.now() - syncedAt.getTime()) / 1000));
  if (seconds < 60) {
    return 'Just now';
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.round(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}
