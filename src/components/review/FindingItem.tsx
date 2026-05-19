import { AlertTriangle } from 'lucide-react';
import { severityLabel } from '../../constants/review';
import type { ReviewFinding } from '../../types';

type FindingItemProps = {
  finding: ReviewFinding;
};

export function FindingItem({ finding }: FindingItemProps) {
  return (
    <article className={`finding ${finding.severity}`}>
      <div className="finding-icon">
        <AlertTriangle size={18} />
      </div>
      <div className="finding-body">
        <div className="finding-title-row">
          <h3>{finding.title}</h3>
          <span>{severityLabel[finding.severity]}</span>
        </div>
        <p>{finding.detail}</p>
        <div className="finding-meta">
          <code>
            {finding.filePath}:{finding.line}
          </code>
          <small>{finding.source === 'ai' ? 'AI finding' : 'Rule finding'}</small>
        </div>
      </div>
    </article>
  );
}
