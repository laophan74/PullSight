import { apiUrl } from './api';
import type { PullRequest } from '../types';

type PullRequestResponse = {
  id: number;
  number: number;
  title: string;
  author: string;
  branch: string;
  targetBranch: string;
  headSha: string;
  changedFiles: number;
  additions: number;
  deletions: number;
  updatedAt: string;
  htmlUrl: string;
};

export async function getPullRequests(owner: string, name: string): Promise<PullRequest[]> {
  const response = await fetch(
    apiUrl(`/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/pull-requests`),
    {
      credentials: 'include',
    },
  );

  if (response.status === 401) {
    throw new Error('Login with GitHub to load pull requests.');
  }

  if (!response.ok) {
    throw new Error('Unable to load pull requests from GitHub.');
  }

  const pullRequests = (await response.json()) as PullRequestResponse[];

  return pullRequests.map((pullRequest) => ({
    id: pullRequest.id,
    number: pullRequest.number,
    title: pullRequest.title,
    author: pullRequest.author,
    branch: pullRequest.branch,
    targetBranch: pullRequest.targetBranch,
    headSha: pullRequest.headSha.slice(0, 7),
    changedFiles: pullRequest.changedFiles,
    additions: pullRequest.additions,
    deletions: pullRequest.deletions,
    updatedAt: formatUpdatedAt(pullRequest.updatedAt),
    htmlUrl: pullRequest.htmlUrl,
  }));
}

function formatUpdatedAt(value: string) {
  const updatedAt = new Date(value);
  if (Number.isNaN(updatedAt.getTime())) {
    return 'Just now';
  }

  const seconds = Math.max(0, Math.round((Date.now() - updatedAt.getTime()) / 1000));
  if (seconds < 60) {
    return 'Just now';
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
