export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type Repository = {
  id: number;
  name: string;
  owner: string;
  fullName: string;
  description?: string | null;
  language: string;
  visibility: 'public' | 'private';
  openPullRequests: number;
  lastSyncedAt: string;
  defaultBranch?: string;
  htmlUrl?: string;
};

export type PullRequest = {
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
  htmlUrl?: string;
};

export type ReviewFinding = {
  id: string;
  severity: Severity;
  filePath: string;
  line: number;
  title: string;
  detail: string;
  source: 'ai' | 'rule';
};

export type ReviewRun = {
  id: string;
  repoName: string;
  prNumber: number;
  headSha: string;
  status: 'cached' | 'completed' | 'fallback';
  analyzer: string;
  riskScore: number;
  createdAt: string;
  quotaRemaining: number;
  summary: string;
  findings: ReviewFinding[];
};
