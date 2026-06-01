import { ChevronDown, Code2 } from 'lucide-react';
import type { Repository } from '../../types';

type RepositoryPickerProps = {
  repositories: Repository[];
  selectedRepo?: Repository;
  isLoading?: boolean;
  error?: string | null;
  onSelect: (repoId: number) => void;
};

export function RepositoryPicker({
  repositories,
  selectedRepo,
  isLoading = false,
  error,
  onSelect,
}: RepositoryPickerProps) {
  const isDisabled = isLoading || repositories.length === 0;

  return (
    <label className="select-field" id="repositories">
      <span>Repository</span>
      <div>
        <Code2 size={18} />
        <select
          value={selectedRepo?.id ?? ''}
          onChange={(event) => onSelect(Number(event.target.value))}
          disabled={isDisabled}
        >
          {isLoading ? <option value="">Loading GitHub repositories...</option> : null}
          {!isLoading && repositories.length === 0 ? (
            <option value="">No repositories found</option>
          ) : null}
          {repositories.map((repo) => (
            <option key={repo.id} value={repo.id}>
              {repo.fullName} ({repo.visibility})
            </option>
          ))}
        </select>
        <ChevronDown size={18} />
      </div>
      {error ? <small className="field-message error">{error}</small> : null}
      {!error && selectedRepo ? (
        <small className="field-message">
          {selectedRepo.language} - default branch {selectedRepo.defaultBranch ?? 'unknown'}
        </small>
      ) : null}
    </label>
  );
}
