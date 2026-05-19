import { Play } from 'lucide-react';
import type { PullRequest, Repository } from '../../types';
import { PullRequestPicker } from './PullRequestPicker';
import { RepositoryPicker } from './RepositoryPicker';

type ReviewControlsProps = {
  repositories: Repository[];
  selectedRepo: Repository;
  pullRequests: PullRequest[];
  selectedPr: PullRequest;
  onRepoSelect: (repoId: number) => void;
  onPrSelect: (prId: number) => void;
};

export function ReviewControls({
  repositories,
  selectedRepo,
  pullRequests,
  selectedPr,
  onRepoSelect,
  onPrSelect,
}: ReviewControlsProps) {
  return (
    <section className="control-strip" aria-label="Review controls">
      <RepositoryPicker
        repositories={repositories}
        selectedRepo={selectedRepo}
        onSelect={onRepoSelect}
      />
      <PullRequestPicker
        pullRequests={pullRequests}
        selectedPr={selectedPr}
        onSelect={onPrSelect}
      />
      <button className="review-button" type="button">
        <Play size={18} />
        Analyze PR
      </button>
    </section>
  );
}
