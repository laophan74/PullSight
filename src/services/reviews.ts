import { apiUrl } from './api';
import type { PullRequestDiff, ReviewFinding, ReviewRun } from '../types';

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
