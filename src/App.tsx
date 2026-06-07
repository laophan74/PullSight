import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ReviewControls } from './components/review/ReviewControls';
import { ReviewMetrics } from './components/review/ReviewMetrics';
import { ReviewPanel } from './components/review/ReviewPanel';
import { RecentReviews } from './components/review/RecentReviews';
import { ReviewSidebar } from './components/review/ReviewSidebar';
import { getGitHubLoginUrl } from './services/api';
import { getCurrentUser, logout, type AuthUser } from './services/auth';
import { getPullRequests } from './services/pullRequests';
import { getRepositories } from './services/repositories';
import { analyzePullRequest, getReviewHistory, getReviewHistoryDetail } from './services/reviews';
import type {
  PullRequest,
  PullRequestDiff,
  Repository,
  ReviewHistoryDetail,
  ReviewHistoryPage,
  ReviewRun,
  Severity,
} from './types';
import { getFilteredFindings } from './utils/review';

export function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginRedirecting, setIsLoginRedirecting] = useState(false);
  const [availableRepositories, setAvailableRepositories] = useState<Repository[]>([]);
  const [isRepositoryLoading, setIsRepositoryLoading] = useState(false);
  const [repositoryError, setRepositoryError] = useState<string | null>(null);
  const [availablePullRequests, setAvailablePullRequests] = useState<PullRequest[]>([]);
  const [isPullRequestLoading, setIsPullRequestLoading] = useState(false);
  const [pullRequestError, setPullRequestError] = useState<string | null>(null);
  const [pullRequestDiff, setPullRequestDiff] = useState<PullRequestDiff | null>(null);
  const [currentReviewRun, setCurrentReviewRun] = useState<ReviewRun | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedRepoId, setSelectedRepoId] = useState<number | undefined>();
  const selectedRepo = availableRepositories.find((repo) => repo.id === selectedRepoId);
  const [selectedPrId, setSelectedPrId] = useState<number | undefined>();
  const selectedPr = availablePullRequests.find((pr) => pr.id === selectedPrId);
  const [activeSeverity, setActiveSeverity] = useState<Severity | 'all'>('all');
  const [reviewHistory, setReviewHistory] = useState<ReviewHistoryPage | null>(null);
  const [selectedHistoryReview, setSelectedHistoryReview] = useState<ReviewHistoryDetail | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isHistoryDetailLoading, setIsHistoryDetailLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyDetailError, setHistoryDetailError] = useState<string | null>(null);

  const filteredFindings = useMemo(
    () => getFilteredFindings(currentReviewRun?.findings ?? [], activeSeverity),
    [activeSeverity, currentReviewRun?.findings],
  );

  useEffect(() => {
    let isMounted = true;

    getCurrentUser()
      .then((user) => {
        if (isMounted) {
          setAuthUser(user);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAuthUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!authUser) {
      setAvailableRepositories([]);
      setAvailablePullRequests([]);
      setRepositoryError(null);
      setPullRequestError(null);
      setSelectedRepoId(undefined);
      setSelectedPrId(undefined);
      setReviewHistory(null);
      setSelectedHistoryReview(null);
      return;
    }

    setAvailableRepositories([]);
    setSelectedRepoId(undefined);
    setAvailablePullRequests([]);
    setSelectedPrId(undefined);
    void loadRepositories();
    void loadReviewHistory(1);
  }, [authUser]);

  useEffect(() => {
    setPullRequestDiff(null);
    setAnalysisError(null);
    setCurrentReviewRun(null);
  }, [selectedRepo?.id, selectedPr?.id]);

  useEffect(() => {
    if (!selectedRepo) {
      setAvailablePullRequests([]);
      setSelectedPrId(undefined);
      setPullRequestError(null);
      return;
    }

    void loadPullRequests(selectedRepo);
  }, [selectedRepo?.id]);

  async function loadRepositories() {
    setIsRepositoryLoading(true);
    setRepositoryError(null);

    try {
      const userRepositories = await getRepositories();

      setAvailableRepositories(userRepositories);
      setSelectedRepoId((currentRepoId) => {
        if (userRepositories.some((repo) => repo.id === currentRepoId)) {
          return currentRepoId;
        }

        return userRepositories[0]?.id;
      });
    } catch (error) {
      setRepositoryError(error instanceof Error ? error.message : 'Unable to load repositories.');
    } finally {
      setIsRepositoryLoading(false);
    }
  }

  async function loadPullRequests(repository: Repository) {
    setIsPullRequestLoading(true);
    setPullRequestError(null);
    setAvailablePullRequests([]);
    setSelectedPrId(undefined);

    try {
      const pullRequests = await getPullRequests(repository.owner, repository.name);

      setAvailablePullRequests(pullRequests);
      setSelectedPrId(pullRequests[0]?.id);
    } catch (error) {
      setPullRequestError(error instanceof Error ? error.message : 'Unable to load pull requests.');
    } finally {
      setIsPullRequestLoading(false);
    }
  }

  async function loadReviewHistory(page: number) {
    setIsHistoryLoading(true);
    setHistoryError(null);

    try {
      const history = await getReviewHistory(page);
      setReviewHistory(history);

      if (
        selectedHistoryReview &&
        !history.items.some((review) => review.id === selectedHistoryReview.id)
      ) {
        setSelectedHistoryReview(null);
      }
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : 'Unable to load recent reviews.');
    } finally {
      setIsHistoryLoading(false);
    }
  }

  async function handleHistoryReviewSelect(reviewId: string) {
    setIsHistoryDetailLoading(true);
    setHistoryDetailError(null);

    try {
      setSelectedHistoryReview(await getReviewHistoryDetail(reviewId));
    } catch (error) {
      setHistoryDetailError(error instanceof Error ? error.message : 'Unable to open saved review.');
      setSelectedHistoryReview(null);
    } finally {
      setIsHistoryDetailLoading(false);
    }
  }

  function handleRepoChange(repoId: number) {
    setSelectedRepoId(repoId);
  }

  function handleLogin() {
    setIsLoginRedirecting(true);
    window.location.assign(getGitHubLoginUrl());
  }

  async function handleLogout() {
    await logout();
    setAuthUser(null);
  }

  async function handleAnalyze() {
    if (!selectedRepo || !selectedPr) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await analyzePullRequest(selectedRepo.owner, selectedRepo.name, selectedPr.number);

      setPullRequestDiff(result.diff);
      setCurrentReviewRun(result.reviewRun);
      setActiveSeverity('all');
      void loadReviewHistory(1);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Unable to analyze pull request.');
      setPullRequestDiff(null);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar authUser={authUser} />

      <main className="workspace" id="dashboard">
        <Topbar
          authUser={authUser}
          isAuthLoading={isAuthLoading || isLoginRedirecting}
          isRefreshingRepositories={isRepositoryLoading}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onRefreshRepositories={loadRepositories}
        />

        <ReviewControls
          repositories={availableRepositories}
          selectedRepo={selectedRepo}
          isRepositoryLoading={isRepositoryLoading}
          repositoryError={repositoryError}
          pullRequests={availablePullRequests}
          selectedPr={selectedPr}
          isPullRequestLoading={isPullRequestLoading}
          pullRequestError={pullRequestError}
          isAnalyzing={isAnalyzing}
          onRepoSelect={handleRepoChange}
          onPrSelect={setSelectedPrId}
          onAnalyze={handleAnalyze}
        />

        <ReviewMetrics
          pullRequest={selectedPr}
          pullRequestDiff={pullRequestDiff}
          reviewRun={currentReviewRun}
        />

        <RecentReviews
          detailError={historyDetailError}
          error={historyError}
          history={reviewHistory}
          isDetailLoading={isHistoryDetailLoading}
          isLoading={isHistoryLoading}
          selectedReview={selectedHistoryReview}
          onPageChange={loadReviewHistory}
          onReviewSelect={handleHistoryReviewSelect}
        />

        <section className="review-layout">
          <ReviewPanel
            activeSeverity={activeSeverity}
            analysisError={analysisError}
            filteredFindings={filteredFindings}
            isAnalyzing={isAnalyzing}
            pullRequest={selectedPr}
            pullRequestDiff={pullRequestDiff}
            reviewRun={currentReviewRun}
            onSeverityChange={setActiveSeverity}
          />
          <ReviewSidebar pullRequestDiff={pullRequestDiff} reviewRun={currentReviewRun} />
        </section>
      </main>
    </div>
  );
}
