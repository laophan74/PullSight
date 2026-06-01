import { ChevronDown, Search } from 'lucide-react';
import type { PullRequest } from '../../types';

type PullRequestPickerProps = {
  pullRequests: PullRequest[];
  selectedPr?: PullRequest;
  onSelect: (prId: number) => void;
};

export function PullRequestPicker({
  pullRequests,
  selectedPr,
  onSelect,
}: PullRequestPickerProps) {
  const isDisabled = pullRequests.length === 0;

  return (
    <label className="select-field">
      <span>Pull request</span>
      <div>
        <Search size={18} />
        <select
          value={selectedPr?.id ?? ''}
          onChange={(event) => onSelect(Number(event.target.value))}
          disabled={isDisabled}
        >
          {isDisabled ? <option value="">Select a repo with open PRs</option> : null}
          {pullRequests.map((pullRequest) => (
            <option key={pullRequest.id} value={pullRequest.id}>
              #{pullRequest.number} {pullRequest.title}
            </option>
          ))}
        </select>
        <ChevronDown size={18} />
      </div>
    </label>
  );
}
