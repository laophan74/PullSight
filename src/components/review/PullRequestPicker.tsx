import { ChevronDown, Search } from 'lucide-react';
import type { PullRequest } from '../../types';

type PullRequestPickerProps = {
  pullRequests: PullRequest[];
  selectedPr?: PullRequest;
  isLoading?: boolean;
  error?: string | null;
  onSelect: (prId: number) => void;
};

export function PullRequestPicker({
  pullRequests,
  selectedPr,
  isLoading = false,
  error,
  onSelect,
}: PullRequestPickerProps) {
  const isDisabled = isLoading || pullRequests.length === 0;

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
          {isLoading ? <option value="">Loading open pull requests...</option> : null}
          {!isLoading && pullRequests.length === 0 ? (
            <option value="">No open pull requests</option>
          ) : null}
          {pullRequests.map((pullRequest) => (
            <option key={pullRequest.id} value={pullRequest.id}>
              #{pullRequest.number} {pullRequest.title}
            </option>
          ))}
        </select>
        <ChevronDown size={18} />
      </div>
      {error ? <small className="field-message error">{error}</small> : null}
      {!error && selectedPr ? (
        <small className="field-message">
          {selectedPr.branch} -&gt; {selectedPr.targetBranch} by {selectedPr.author}
        </small>
      ) : null}
    </label>
  );
}
