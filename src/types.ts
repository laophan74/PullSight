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

export type PullRequestDiffFile = {
  sha: string;
  fileName: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string | null;
  blobUrl: string;
  rawUrl: string;
  previousFileName?: string | null;
};

export type PullRequestDiff = {
  repositoryId: number;
  repositoryFullName: string;
  id: number;
  number: number;
  title: string;
  headSha: string;
  changedFiles: number;
  additions: number;
  deletions: number;
  files: PullRequestDiffFile[];
};

export type ReviewFinding = {
  id: string;
  severity: Severity;
  filePath: string;
  line: number;
  title: string;
  detail: string;
  source: 'ai' | 'rule';
  suggestion?: string | null;
  isInlineCommentable: boolean;
};

export type ReviewStatus = 'queued' | 'analyzing' | 'completed' | 'fallback' | 'failed';

export type ReviewSummary = {
  overview: string;
  riskOverview: string;
  keyChanges: string[];
  suggestedTestPlan: string[];
};

export type ReviewRun = {
  id: string;
  repoName: string;
  prNumber: number;
  headSha: string;
  status: ReviewStatus | 'cached';
  analyzer: string;
  riskScore: number;
  createdAt: string;
  quotaRemaining: number;
  summary: string;
  summaryDetails: ReviewSummary;
  errorMessage?: string | null;
  findings: ReviewFinding[];
};

export type ReviewHistoryItem = {
  id: string;
  repositoryFullName: string;
  pullRequestNumber: number;
  headSha: string;
  status: ReviewStatus;
  source: 'ai' | 'rule' | 'pending' | 'system';
  analyzer: string;
  riskScore: number;
  summary: string;
  summaryDetails: ReviewSummary;
  errorMessage?: string | null;
  findingCount: number;
  createdAt: string;
};

export type ReviewHistoryPage = {
  items: ReviewHistoryItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type ReviewHistoryFilters = {
  repository: string;
  pullRequestNumber: string;
  source: string;
  status: string;
};

export type ReviewHistoryDetail = ReviewHistoryItem & {
  findings: ReviewFinding[];
};

export type ReviewComparison = {
  baseRun: ReviewHistoryItem;
  targetRun: ReviewHistoryItem;
  added: ReviewFinding[];
  resolved: ReviewFinding[];
  unchanged: ReviewFinding[];
};

export type ReportFormat = 'markdown' | 'json';

export type ReviewPublishResult = {
  status: 'created' | 'updated';
  commentId: number;
  commentUrl: string;
};

export type CheckRunPublishResult = {
  status: 'created' | 'updated';
  checkRunId: number;
  checkRunUrl: string;
  conclusion: 'failure' | 'neutral' | 'success';
  annotationCount: number;
};

export type InlinePublishStatus =
  | 'publishing'
  | 'created'
  | 'updated'
  | 'alreadyPublished'
  | 'skipped'
  | 'failed';

export type InlineCommentPublishItem = {
  findingId: string;
  status: Exclude<InlinePublishStatus, 'publishing'>;
  commentId?: number | null;
  commentUrl?: string | null;
  reasonCode?: string | null;
  message?: string | null;
};

export type InlineCommentsPublishResult = {
  items: InlineCommentPublishItem[];
  created: number;
  updated: number;
  alreadyPublished: number;
  skipped: number;
  failed: number;
};
