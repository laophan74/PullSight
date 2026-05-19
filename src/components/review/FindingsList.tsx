import type { ReviewFinding } from '../../types';
import { FindingItem } from './FindingItem';

type FindingsListProps = {
  findings: ReviewFinding[];
};

export function FindingsList({ findings }: FindingsListProps) {
  return (
    <div className="findings-list">
      {findings.map((finding) => (
        <FindingItem finding={finding} key={finding.id} />
      ))}
    </div>
  );
}
