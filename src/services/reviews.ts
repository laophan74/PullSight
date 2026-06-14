import { apiUrl } from './api';
import type {
  PullRequestDiff,
  ReviewFinding,
  ReviewComparison,
  ReviewHistoryDetail,
  ReviewHistoryFilters,
  ReviewHistoryPage,
  ReportFormat,
  ReviewRun,
  ReviewPublishResult,
} from '../types';

type PullRequestReviewResponse = {
  reviewRun: ReviewRunResponse;
  diff: PullRequestDiff;
};

type ReviewRunResponse = {
  id: string;
  repositoryName: string;
  pullRequestNumber: number;
  headSha: string;
  status: ReviewRun['status'];
  analyzer: string;
  riskScore: number;
  quotaRemaining: number;
  createdAt: string;
  summary: string;
  findings: ReviewFindingResponse[];
};

type ReviewFindingResponse = {
  id: string;
  severity: ReviewFinding['severity'];
  filePath: string;
  line: number;
  title: string;
  detail: string;
  source: ReviewFinding['source'];
};

type ReviewHistoryPageResponse = Omit<ReviewHistoryPage, 'items'> & {
  items: ReviewHistoryItemResponse[];
};

type ReviewHistoryItemResponse = {
  id: string;
  repositoryFullName: string;
  pullRequestNumber: number;
  headSha: string;
  status: ReviewHistoryDetail['status'];
  source: ReviewHistoryDetail['source'];
  analyzer: string;
  riskScore: number;
  summary: string;
  findingCount: number;
  createdAt: string;
};

type ReviewHistoryDetailResponse = ReviewHistoryItemResponse & {
  findings: ReviewFindingResponse[];
};

type ReviewComparisonResponse = {
  baseRun: ReviewHistoryItemResponse;
  targetRun: ReviewHistoryItemResponse;
  added: ReviewFindingResponse[];
  resolved: ReviewFindingResponse[];
  unchanged: ReviewFindingResponse[];
};

type ProblemDetailsResponse = {
  detail?: string;
};

type DownloadedReport = {
  blob: Blob;
  filename: string;
};

export async function analyzePullRequest(
  owner: string,
  name: string,
  number: number,
): Promise<{ reviewRun: ReviewRun; diff: PullRequestDiff }> {
  const response = await fetch(apiUrl('/api/reviews/github'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      owner,
      name,
      number,
    }),
  });

  if (response.status === 401) {
    throw new Error('Login with GitHub to analyze pull requests.');
  }

  if (!response.ok) {
    throw new Error('Unable to analyze pull request.');
  }

  const payload = (await response.json()) as PullRequestReviewResponse;

  return {
    diff: payload.diff,
    reviewRun: {
      id: payload.reviewRun.id,
      repoName: payload.reviewRun.repositoryName,
      prNumber: payload.reviewRun.pullRequestNumber,
      headSha: payload.reviewRun.headSha,
      status: payload.reviewRun.status,
      analyzer: payload.reviewRun.analyzer,
      riskScore: payload.reviewRun.riskScore,
      createdAt: new Date(payload.reviewRun.createdAt).toLocaleString(),
      quotaRemaining: payload.reviewRun.quotaRemaining,
      summary: payload.reviewRun.summary,
      findings: payload.reviewRun.findings.map((finding) => ({
        id: finding.id,
        severity: finding.severity,
        filePath: finding.filePath,
        line: finding.line,
        title: finding.title,
        detail: finding.detail,
        source: finding.source,
      })),
    },
  };
}

export async function getReviewHistory(
  page = 1,
  pageSize = 10,
  filters?: ReviewHistoryFilters,
): Promise<ReviewHistoryPage> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (filters?.repository) query.set('repository', filters.repository);
  if (filters?.pullRequestNumber) query.set('pullRequestNumber', filters.pullRequestNumber);
  if (filters?.source) query.set('source', filters.source);
  if (filters?.status) query.set('status', filters.status);

  const response = await fetch(apiUrl(`/api/reviews?${query.toString()}`), {
    credentials: 'include',
  });

  if (response.status === 401) {
    throw new Error('Login with GitHub to view recent reviews.');
  }

  if (!response.ok) {
    throw new Error('Unable to load recent reviews.');
  }

  return (await response.json()) as ReviewHistoryPageResponse;
}

export async function getReviewHistoryDetail(reviewId: string): Promise<ReviewHistoryDetail> {
  const response = await fetch(apiUrl(`/api/reviews/${reviewId}`), {
    credentials: 'include',
  });

  if (response.status === 401) {
    throw new Error('Login with GitHub to open saved reviews.');
  }

  if (response.status === 404) {
    throw new Error('This saved review was not found.');
  }

  if (!response.ok) {
    throw new Error('Unable to open the saved review.');
  }

  return (await response.json()) as ReviewHistoryDetailResponse;
}

export async function compareReviews(
  baseReviewRunId: string,
  targetReviewRunId: string,
): Promise<ReviewComparison> {
  const response = await fetch(apiUrl('/api/reviews/compare'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      baseReviewRunId,
      targetReviewRunId,
    }),
  });

  if (response.status === 401) {
    throw new Error('Login with GitHub to compare saved reviews.');
  }

  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as ProblemDetailsResponse | null;
    throw new Error(problem?.detail ?? 'Unable to compare the selected reviews.');
  }

  return (await response.json()) as ReviewComparisonResponse;
}

export async function exportReview(
  reviewId: string,
  format: ReportFormat,
): Promise<DownloadedReport> {
  return downloadReport(`/api/reviews/${reviewId}/export?format=${format}`, {
    credentials: 'include',
  });
}

export async function exportComparison(
  baseReviewRunId: string,
  targetReviewRunId: string,
  format: ReportFormat,
): Promise<DownloadedReport> {
  return downloadReport('/api/reviews/compare/export', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseReviewRunId, targetReviewRunId, format }),
  });
}

export async function publishReview(reviewId: string): Promise<ReviewPublishResult> {
  return publishReport(`/api/reviews/${reviewId}/publish`);
}

export async function publishComparison(
  baseReviewRunId: string,
  targetReviewRunId: string,
): Promise<ReviewPublishResult> {
  return publishReport('/api/reviews/compare/publish', {
    baseReviewRunId,
    targetReviewRunId,
  });
}

export function saveDownloadedReport(report: DownloadedReport) {
  const url = URL.createObjectURL(report.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = report.filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function downloadReport(path: string, init: RequestInit): Promise<DownloadedReport> {
  const response = await fetch(apiUrl(path), init);
  if (!response.ok) {
    throw new Error(await readProblem(response, 'Unable to export this report.'));
  }

  return {
    blob: await response.blob(),
    filename: getFilename(response.headers.get('Content-Disposition')) ?? 'pullsight-report',
  };
}

async function publishReport(
  path: string,
  body?: { baseReviewRunId: string; targetReviewRunId: string },
): Promise<ReviewPublishResult> {
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await readProblem(response, 'Unable to publish this report to GitHub.'));
  }

  return (await response.json()) as ReviewPublishResult;
}

async function readProblem(response: Response, fallback: string) {
  if (response.status === 401) {
    return 'Login with GitHub again to continue.';
  }

  const problem = (await response.json().catch(() => null)) as ProblemDetailsResponse | null;
  return problem?.detail ?? fallback;
}

function getFilename(contentDisposition: string | null) {
  const match = contentDisposition?.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
  return match ? decodeURIComponent(match[1].replace(/"$/, '')) : null;
}
