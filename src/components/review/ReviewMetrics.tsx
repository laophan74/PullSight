import type { PullRequest, PullRequestDiff, ReviewRun } from '../../types';
import { Metric } from '../ui/Metric';

type ReviewMetricsProps = {
  pullRequest?: PullRequest;
  pullRequestDiff?: PullRequestDiff | null;
  reviewRun?: ReviewRun | null;
};

export function ReviewMetrics({ pullRequest, pullRequestDiff, reviewRun }: ReviewMetricsProps) {
  if (!pullRequest) {
    return (
      <section className="metrics-grid" aria-label="Review metrics">
        <Metric label="Risk score" value="--" detail="Choose a pull request" tone="risk" />
        <Metric label="Changed files" value="--" detail="Waiting for PR data" />
        <Metric label="Analyzer" value="--" detail="No review run yet" />
        <Metric label="Cache key" value="--" detail="No PR selected" />
      </section>
    );
  }

  return (
    <section className="metrics-grid" aria-label="Review metrics">
      <Metric
        label="Risk score"
        value={reviewRun ? `${reviewRun.riskScore}/100` : '--'}
        detail={reviewRun ? reviewRun.status : 'Run Analyze PR'}
        tone="risk"
      />
      <Metric
        label="Changed files"
        value={String(pullRequestDiff?.changedFiles ?? pullRequest.changedFiles)}
        detail={`+${pullRequestDiff?.additions ?? pullRequest.additions} / -${
          pullRequestDiff?.deletions ?? pullRequest.deletions
        }`}
      />
      <Metric
        label="Analyzer"
        value={reviewRun?.analyzer ?? '--'}
        detail={reviewRun ? 'Latest review run' : 'No review run yet'}
      />
      <Metric
        label="Head SHA"
        value={(pullRequestDiff?.headSha ?? pullRequest.headSha).slice(0, 7)}
        detail={`PR #${pullRequest.number}`}
      />
    </section>
  );
}
