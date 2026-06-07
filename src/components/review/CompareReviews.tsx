import { ArrowRight, GitCompareArrows, LoaderCircle } from 'lucide-react';
import type { ReviewComparison, ReviewFinding, ReviewHistoryItem } from '../../types';
import { FindingsList } from './FindingsList';

type CompareReviewsProps = {
  selectedReviews: ReviewHistoryItem[];
  comparison: ReviewComparison | null;
  isLoading: boolean;
  error: string | null;
  onCompare: () => void;
  onClear: () => void;
};

export function CompareReviews({
  selectedReviews,
  comparison,
  isLoading,
  error,
  onCompare,
  onClear,
}: CompareReviewsProps) {
  const selectionIsValid =
    selectedReviews.length === 2 &&
    selectedReviews[0].repositoryFullName === selectedReviews[1].repositoryFullName &&
    selectedReviews[0].pullRequestNumber === selectedReviews[1].pullRequestNumber;

  return (
    <section className="compare-section" id="compare-reviews" aria-labelledby="compare-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Across commits</p>
          <h2 id="compare-title">Compare reviews</h2>
        </div>
        <div className="compare-actions">
          {selectedReviews.length > 0 ? (
            <button className="secondary-button" onClick={onClear} type="button">
              Clear
            </button>
          ) : null}
          <button
            className="primary-button"
            disabled={!selectionIsValid || isLoading}
            onClick={onCompare}
            type="button"
          >
            {isLoading ? (
              <LoaderCircle className="spin-icon" aria-hidden="true" size={17} />
            ) : (
              <GitCompareArrows aria-hidden="true" size={17} />
            )}
            {isLoading ? 'Comparing...' : 'Compare selected'}
          </button>
        </div>
      </div>

      {selectedReviews.length === 0 ? (
        <p className="compare-state">Select two saved runs for the same pull request.</p>
      ) : null}
      {selectedReviews.length === 1 ? (
        <p className="compare-state">Select one more run from the same pull request.</p>
      ) : null}
      {selectedReviews.length === 2 && !selectionIsValid ? (
        <p className="compare-state error" role="alert">
          Selected runs must belong to the same repository and pull request.
        </p>
      ) : null}
      {error ? (
        <p className="compare-state error" role="alert">
          {error}
        </p>
      ) : null}

      {comparison ? (
        <>
          <div className="compare-run-grid">
            <RunCard label="Base run" run={comparison.baseRun} />
            <ArrowRight className="compare-arrow" aria-hidden="true" size={22} />
            <RunCard label="Target run" run={comparison.targetRun} />
          </div>
          <div className="comparison-groups">
            <ComparisonGroup
              className="added"
              description="New in the target run"
              findings={comparison.added}
              title="Added"
            />
            <ComparisonGroup
              className="resolved"
              description="Present in the base run, absent from target"
              findings={comparison.resolved}
              title="Resolved"
            />
            <ComparisonGroup
              className="unchanged"
              description="Still present with the same identity"
              findings={comparison.unchanged}
              title="Unchanged"
            />
          </div>
        </>
      ) : null}
    </section>
  );
}

function RunCard({ label, run }: { label: string; run: ReviewHistoryItem }) {
  return (
    <article className="compare-run-card">
      <span>{label}</span>
      <strong>
        {run.repositoryFullName} PR #{run.pullRequestNumber}
      </strong>
      <code title={run.headSha}>{shortSha(run.headSha)}</code>
      <small>
        {formatDate(run.createdAt)} · Risk {run.riskScore} · {run.findingCount} findings
      </small>
    </article>
  );
}

function ComparisonGroup({
  title,
  description,
  findings,
  className,
}: {
  title: string;
  description: string;
  findings: ReviewFinding[];
  className: string;
}) {
  return (
    <section className={`comparison-group ${className}`} aria-labelledby={`comparison-${className}`}>
      <div className="comparison-group-heading">
        <div>
          <h3 id={`comparison-${className}`}>{title}</h3>
          <p>{description}</p>
        </div>
        <span>{findings.length}</span>
      </div>
      {findings.length > 0 ? (
        <FindingsList findings={findings} />
      ) : (
        <p className="comparison-empty">No {title.toLowerCase()} findings.</p>
      )}
    </section>
  );
}

function shortSha(sha: string) {
  return sha.slice(0, 10);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}
