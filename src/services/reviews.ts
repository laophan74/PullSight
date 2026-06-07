import { apiUrl } from './api';
import type {
  PullRequestDiff,
  ReviewFinding,
  ReviewComparison,
  ReviewHistoryDetail,
  ReviewHistoryPage,
  ReviewRun,
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

export async function getReviewHistory(page = 1, pageSize = 10): Promise<ReviewHistoryPage> {
  const response = await fetch(apiUrl(`/api/reviews?page=${page}&pageSize=${pageSize}`), {
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
