import type { PullRequest, PullRequestDiff, ReviewRun } from '../../types';
import { Metric } from '../ui/Metric';

type ReviewMetricsProps = {
  pullRequest?: PullRequest;
  pullRequestDiff?: PullRequestDiff | null;
  reviewRun: ReviewRun;
};

export function ReviewMetrics({ pullRequest, pullRequestDiff, reviewRun }: ReviewMetricsProps) {
  if (!pullRequest) {
    return (
      <section className="metrics-grid" aria-label="Review metrics">
        <Metric label="Risk score" value="--" detail="Choose a pull request" tone="risk" />
        <Metric label="Changed files" value="--" detail="Waiting for PR data" />
        <Metric label="AI quota" value={`${reviewRun.quotaRemaining}/5`} detail="Daily reviews left" />
        <Metric label="Cache key" value="--" detail="No PR selected" />
      </section>
    );
  }

  return (
    <section className="metrics-grid" aria-label="Review metrics">
      <Metric
        label="Risk score"
        value={`${reviewRun.riskScore}/100`}
        detail="High attention"
        tone="risk"
      />
      <Metric
        label="Changed files"
        value={String(pullRequestDiff?.changedFiles ?? pullRequest.changedFiles)}
        detail={`+${pullRequestDiff?.additions ?? pullRequest.additions} / -${
          pullRequestDiff?.deletions ?? pullRequest.deletions
        }`}
      />
      <Metric label="AI quota" value={`${reviewRun.quotaRemaining}/5`} detail="Daily reviews left" />
      <Metric
        label="Head SHA"
        value={(pullRequestDiff?.headSha ?? pullRequest.headSha).slice(0, 7)}
        detail={`PR #${pullRequest.number}`}
      />
    </section>
  );
}
