import type { ReviewSummary } from '../../types';

type ReviewSummaryCardProps = {
  summary: ReviewSummary;
};

export function ReviewSummaryCard({ summary }: ReviewSummaryCardProps) {
  return (
    <section className="summary-card" aria-label="Review summary">
      <div>
        <h3>Overview</h3>
        <p>{summary.overview}</p>
      </div>
      <div>
        <h3>Risk overview</h3>
        <p>{summary.riskOverview}</p>
      </div>
      <div className="summary-list">
        <h3>Key changes</h3>
        <ul>
          {summary.keyChanges.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="summary-list">
        <h3>Suggested test plan</h3>
        <ul>
          {summary.suggestedTestPlan.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

