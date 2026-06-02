import { apiUrl } from './api';
import type { PullRequestDiff } from '../types';

type PullRequestDiffResponse = PullRequestDiff;

export async function getPullRequestDiff(
  owner: string,
  name: string,
  number: number,
): Promise<PullRequestDiff> {
  const response = await fetch(
    apiUrl(
      `/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(
        name,
      )}/pull-requests/${number}/diff`,
    ),
    {
      credentials: 'include',
    },
  );

  if (response.status === 401) {
    throw new Error('Login with GitHub to analyze pull requests.');
  }

  if (!response.ok) {
    throw new Error('Unable to fetch pull request diff from GitHub.');
  }

  return (await response.json()) as PullRequestDiffResponse;
}
