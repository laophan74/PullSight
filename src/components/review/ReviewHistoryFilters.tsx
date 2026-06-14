import { FilterX } from 'lucide-react';
import type { Repository, ReviewHistoryFilters } from '../../types';

type ReviewHistoryFiltersProps = {
  filters: ReviewHistoryFilters;
  repositories: Repository[];
  disabled: boolean;
  onChange: (filters: ReviewHistoryFilters) => void;
  onClear: () => void;
};

export function ReviewHistoryFiltersBar({
  filters,
  repositories,
  disabled,
  onChange,
  onClear,
}: ReviewHistoryFiltersProps) {
  const hasFilters = Object.values(filters).some(Boolean);

  function updateFilter(name: keyof ReviewHistoryFilters, value: string) {
    onChange({ ...filters, [name]: value });
  }

  return (
    <div className="history-filters" aria-label="Review history filters">
      <label>
        Repository
        <select
          aria-label="Filter reviews by repository"
          disabled={disabled}
          onChange={(event) => updateFilter('repository', event.target.value)}
          value={filters.repository}
        >
          <option value="">All repositories</option>
          {repositories.map((repository) => (
            <option key={repository.id} value={repository.fullName}>
              {repository.fullName}
            </option>
          ))}
        </select>
      </label>

      <label>
        PR number
        <input
          aria-label="Filter reviews by pull request number"
          disabled={disabled}
          inputMode="numeric"
          min="1"
          onChange={(event) =>
            updateFilter('pullRequestNumber', event.target.value.replace(/\D/g, ''))
          }
          placeholder="Any PR"
          type="text"
          value={filters.pullRequestNumber}
        />
      </label>

      <label>
        Source
        <select
          aria-label="Filter reviews by source"
          disabled={disabled}
          onChange={(event) => updateFilter('source', event.target.value)}
          value={filters.source}
        >
          <option value="">All sources</option>
          <option value="ai">AI</option>
          <option value="rule">Rule fallback</option>
        </select>
      </label>

      <label>
        Status
        <select
          aria-label="Filter reviews by status"
          disabled={disabled}
          onChange={(event) => updateFilter('status', event.target.value)}
          value={filters.status}
        >
          <option value="">All statuses</option>
          <option value="queued">Queued</option>
          <option value="analyzing">Analyzing</option>
          <option value="completed">Completed</option>
          <option value="fallback">Fallback</option>
          <option value="failed">Failed</option>
        </select>
      </label>

      <button
        className="secondary-button filter-clear"
        disabled={disabled || !hasFilters}
        onClick={onClear}
        type="button"
      >
        <FilterX aria-hidden="true" size={16} />
        Clear filters
      </button>
    </div>
  );
}
