import { severityLabel, severityOrder } from '../../constants/review';
import type { ReviewFinding, Severity } from '../../types';
import { getSeverityCount } from '../../utils/review';

type SeverityTabsProps = {
  activeSeverity: Severity | 'all';
  findings: ReviewFinding[];
  onChange: (severity: Severity | 'all') => void;
};

export function SeverityTabs({ activeSeverity, findings, onChange }: SeverityTabsProps) {
  return (
    <div className="severity-tabs" role="tablist" aria-label="Filter findings">
      <button
        className={activeSeverity === 'all' ? 'active' : ''}
        type="button"
        onClick={() => onChange('all')}
      >
        All
        <span>{findings.length}</span>
      </button>
      {severityOrder.map((severity) => (
        <button
          className={activeSeverity === severity ? 'active' : ''}
          key={severity}
          type="button"
          onClick={() => onChange(severity)}
        >
          {severityLabel[severity]}
          <span>{getSeverityCount(findings, severity)}</span>
        </button>
      ))}
    </div>
  );
}
