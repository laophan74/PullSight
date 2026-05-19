import type { PullRequest, ReviewRun } from '../../types';
import { Metric } from '../ui/Metric';

type ReviewMetricsProps = {
  pullRequest: PullRequest;
  reviewRun: ReviewRun;
};

export function ReviewMetrics({ pullRequest, reviewRun }: ReviewMetricsProps) {
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
        value={String(pullRequest.changedFiles)}
        detail={`+${pullRequest.additions} / -${pullRequest.deletions}`}
      />
      <Metric label="AI quota" value={`${reviewRun.quotaRemaining}/5`} detail="Daily reviews left" />
      <Metric label="Cache key" value={pullRequest.headSha} detail={`PR #${pullRequest.number}`} />
    </section>
  );
}
