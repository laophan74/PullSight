import { ChevronDown, Code2 } from 'lucide-react';
import type { Repository } from '../../types';

type RepositoryPickerProps = {
  repositories: Repository[];
  selectedRepo: Repository;
  onSelect: (repoId: number) => void;
};

export function RepositoryPicker({
  repositories,
  selectedRepo,
  onSelect,
}: RepositoryPickerProps) {
  return (
    <label className="select-field" id="repositories">
      <span>Repository</span>
      <div>
        <Code2 size={18} />
        <select value={selectedRepo.id} onChange={(event) => onSelect(Number(event.target.value))}>
          {repositories.map((repo) => (
            <option key={repo.id} value={repo.id}>
              {repo.owner}/{repo.name}
            </option>
          ))}
        </select>
        <ChevronDown size={18} />
      </div>
    </label>
  );
}
