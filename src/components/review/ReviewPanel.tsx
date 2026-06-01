import { Sparkles } from 'lucide-react';
import type { PullRequest, ReviewFinding, ReviewRun, Severity } from '../../types';
import { FindingsList } from './FindingsList';
import { SeverityTabs } from './SeverityTabs';

type ReviewPanelProps = {
  activeSeverity: Severity | 'all';
  filteredFindings: ReviewFinding[];
  pullRequest?: PullRequest;
  reviewRun: ReviewRun;
  onSeverityChange: (severity: Severity | 'all') => void;
};

export function ReviewPanel({
  activeSeverity,
  filteredFindings,
  pullRequest,
  reviewRun,
  onSeverityChange,
}: ReviewPanelProps) {
  if (!pullRequest) {
    return (
      <article className="review-main empty-state">
        <div>
          <p className="eyebrow">Current review</p>
          <h2>Select an open pull request to continue</h2>
        </div>
        <p className="review-summary">
          PullSight now loads open pull requests from GitHub for the selected repository. Choose a
          PR above to review its details.
        </p>
      </article>
    );
  }

  return (
    <article className="review-main">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Current review</p>
          <h2>{pullRequest.title}</h2>
        </div>
        <span className={`status-pill ${reviewRun.status}`}>
          <Sparkles size={15} />
          {reviewRun.status}
        </span>
      </div>

      <p className="review-summary">{reviewRun.summary}</p>

      <SeverityTabs
        activeSeverity={activeSeverity}
        findings={reviewRun.findings}
        onChange={onSeverityChange}
      />

      <FindingsList findings={filteredFindings} />
    </article>
  );
}
