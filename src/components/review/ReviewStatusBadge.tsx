import type { ReviewStatus } from '../../types';

type ReviewStatusBadgeProps = {
  status: ReviewStatus | 'cached';
};

export function ReviewStatusBadge({ status }: ReviewStatusBadgeProps) {
  return (
    <span className={`status-badge status-${status}`} aria-label={`Review status: ${status}`}>
      {status}
    </span>
  );
}

