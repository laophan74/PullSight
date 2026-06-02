import { LoaderCircle, Play } from 'lucide-react';
import type { PullRequest, Repository } from '../../types';
import { PullRequestPicker } from './PullRequestPicker';
import { RepositoryPicker } from './RepositoryPicker';

type ReviewControlsProps = {
  repositories: Repository[];
  selectedRepo?: Repository;
  isRepositoryLoading?: boolean;
  repositoryError?: string | null;
  pullRequests: PullRequest[];
  selectedPr?: PullRequest;
  isPullRequestLoading?: boolean;
  pullRequestError?: string | null;
  isAnalyzing?: boolean;
  onRepoSelect: (repoId: number) => void;
  onPrSelect: (prId: number) => void;
  onAnalyze: () => void;
};

export function ReviewControls({
  repositories,
  selectedRepo,
  isRepositoryLoading,
  repositoryError,
  pullRequests,
  selectedPr,
  isPullRequestLoading,
  pullRequestError,
  isAnalyzing = false,
  onRepoSelect,
  onPrSelect,
  onAnalyze,
}: ReviewControlsProps) {
  return (
    <section className="control-strip" aria-label="Review controls">
      <RepositoryPicker
        repositories={repositories}
        selectedRepo={selectedRepo}
        isLoading={isRepositoryLoading}
        error={repositoryError}
        onSelect={onRepoSelect}
      />
      <PullRequestPicker
        pullRequests={pullRequests}
        selectedPr={selectedPr}
        isLoading={isPullRequestLoading}
        error={pullRequestError}
        onSelect={onPrSelect}
      />
      <button
        className="review-button"
        type="button"
        disabled={!selectedRepo || !selectedPr || isAnalyzing}
        onClick={onAnalyze}
      >
        {isAnalyzing ? <LoaderCircle className="spin-icon" size={18} /> : <Play size={18} />}
        {isAnalyzing ? 'Fetching diff' : 'Analyze PR'}
      </button>
    </section>
  );
}
