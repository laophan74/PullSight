import { Bot, Clock3, Lock } from 'lucide-react';
import type { PullRequestDiff, ReviewRun } from '../../types';

const fallbackRules = [
  'Missing authorization',
  'Raw SQL interpolation',
  'Large PR threshold',
  'Tests changed or absent',
  'Secrets and tokens',
];

type ReviewSidebarProps = {
  pullRequestDiff?: PullRequestDiff | null;
  reviewRun?: ReviewRun | null;
};

export function ReviewSidebar({ pullRequestDiff, reviewRun }: ReviewSidebarProps) {
  const hasDiff = Boolean(pullRequestDiff);
  const hasReview = Boolean(reviewRun);
  const isPersisted = hasReview && !reviewRun?.summary.includes('Review storage is temporarily unavailable');

  return (
    <aside className="review-side" aria-label="Review context">
      <div className="side-section">
        <div className="section-heading compact">
          <h2>Pipeline</h2>
          <Clock3 size={18} />
        </div>
        <ol className="timeline">
          <li className={hasDiff ? 'done' : ''}>GitHub diff fetched</li>
          <li className={hasReview ? 'done' : ''}>Analyzer completed</li>
          <li className={isPersisted ? 'done' : ''}>Persist findings to Supabase</li>
        </ol>
      </div>

      <div className="side-section">
        <div className="section-heading compact">
          <h2>Fallback rules</h2>
          <Bot size={18} />
        </div>
        <div className="rule-list">
          {fallbackRules.map((rule) => (
            <span key={rule}>{rule}</span>
          ))}
        </div>
      </div>

      <div className="side-section quiet" id="quota">
        <Lock size={18} />
        <p>
          Free-tier friendly by design: reviews run on demand, cache by PR head SHA, and fall back
          to static analysis when Gemini is unavailable.
        </p>
      </div>
    </aside>
  );
}
