import type { InlinePublishStatus, ReviewFinding } from '../../types';
import { FindingItem } from './FindingItem';

type FindingsListProps = {
  findings: ReviewFinding[];
  publishStates?: Record<string, { status: InlinePublishStatus; message?: string | null }>;
  onPublish?: (findingId: string) => void;
};

export function FindingsList({ findings, publishStates, onPublish }: FindingsListProps) {
  return (
    <div className="findings-list">
      {findings.map((finding) => (
        <FindingItem
          finding={finding}
          key={finding.id}
          onPublish={onPublish}
          publishMessage={publishStates?.[finding.id]?.message}
          publishStatus={publishStates?.[finding.id]?.status}
        />
      ))}
    </div>
  );
}
