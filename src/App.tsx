import { useEffect, useMemo, useState } from 'react';
import { Sidebar, type DashboardView } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ReviewControls } from './components/review/ReviewControls';
import { ReviewMetrics } from './components/review/ReviewMetrics';
import { ReviewPanel } from './components/review/ReviewPanel';
import { RecentReviews } from './components/review/RecentReviews';
import { CompareReviews } from './components/review/CompareReviews';
import { ReviewSidebar } from './components/review/ReviewSidebar';
import { getGitHubLoginUrl } from './services/api';
import { getCurrentUser, logout, type AuthUser } from './services/auth';
import { getPullRequests } from './services/pullRequests';
import { getRepositories } from './services/repositories';
import {
  analyzePullRequest,
  compareReviews,
  exportComparison,
  exportReview,
  getReviewHistory,
  getReviewHistoryDetail,
  publishComparison,
  publishReview,
  saveDownloadedReport,
} from './services/reviews';
import type {
  PullRequest,
  PullRequestDiff,
  Repository,
  ReviewHistoryDetail,
  ReviewHistoryItem,
  ReviewHistoryPage,
  ReviewHistoryFilters,
  ReviewComparison,
  ReviewRun,
  ReportFormat,
  Severity,
} from './types';
import { getFilteredFindings } from './utils/review';

export function App() {
  const [activeView, setActiveView] = useState<DashboardView>(getViewFromHash);
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
  const [comparisonSelection, setComparisonSelection] = useState<ReviewHistoryItem[]>([]);
  const [reviewComparison, setReviewComparison] = useState<ReviewComparison | null>(null);
  const [isComparisonLoading, setIsComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [historyFilters, setHistoryFilters] = useState<ReviewHistoryFilters>(emptyHistoryFilters);
  const [isReviewExporting, setIsReviewExporting] = useState(false);
  const [isReviewPublishing, setIsReviewPublishing] = useState(false);
  const [reviewActionMessage, setReviewActionMessage] = useState<string | null>(null);
  const [reviewActionError, setReviewActionError] = useState<string | null>(null);
  const [isComparisonExporting, setIsComparisonExporting] = useState(false);
  const [isComparisonPublishing, setIsComparisonPublishing] = useState(false);
  const [comparisonActionMessage, setComparisonActionMessage] = useState<string | null>(null);
  const [comparisonActionError, setComparisonActionError] = useState<string | null>(null);

  const filteredFindings = useMemo(
    () => getFilteredFindings(currentReviewRun?.findings ?? [], activeSeverity),
    [activeSeverity, currentReviewRun?.findings],
  );

  useEffect(() => {
    function handleHashChange() {
      setActiveView(getViewFromHash());
    }

    window.addEventListener('hashchange', handleHashChange);

    if (!window.location.hash) {
      window.history.replaceState(null, '', '#reviews');
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

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
      setComparisonSelection([]);
      setReviewComparison(null);
      return;
    }

    setAvailableRepositories([]);
    setSelectedRepoId(undefined);
    setAvailablePullRequests([]);
    setSelectedPrId(undefined);
    void loadRepositories();
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      return;
    }

    setSelectedHistoryReview(null);
    setComparisonSelection([]);
    setReviewComparison(null);
    setComparisonError(null);
    setReviewActionMessage(null);
    setReviewActionError(null);
    setComparisonActionMessage(null);
    setComparisonActionError(null);
    void loadReviewHistory(1, historyFilters);
  }, [
    authUser,
    historyFilters.repository,
    historyFilters.pullRequestNumber,
    historyFilters.source,
    historyFilters.status,
  ]);

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

  async function loadReviewHistory(page: number, filters = historyFilters) {
    setIsHistoryLoading(true);
    setHistoryError(null);

    try {
      const history = await getReviewHistory(page, 10, filters);
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

  function handleComparisonToggle(review: ReviewHistoryItem) {
    setComparisonError(null);
    setReviewComparison(null);
    setComparisonSelection((currentSelection) => {
      if (currentSelection.some((item) => item.id === review.id)) {
        return currentSelection.filter((item) => item.id !== review.id);
      }

      if (currentSelection.length >= 2) {
        return [currentSelection[1], review];
      }

      return [...currentSelection, review];
    });
  }

  async function handleCompareReviews() {
    if (comparisonSelection.length !== 2) {
      return;
    }

    setIsComparisonLoading(true);
    setComparisonError(null);

    try {
      setReviewComparison(
        await compareReviews(comparisonSelection[0].id, comparisonSelection[1].id),
      );
    } catch (error) {
      setComparisonError(
        error instanceof Error ? error.message : 'Unable to compare the selected reviews.',
      );
      setReviewComparison(null);
    } finally {
      setIsComparisonLoading(false);
    }
  }

  function handleComparisonClear() {
    setComparisonSelection([]);
    setReviewComparison(null);
    setComparisonError(null);
  }

  function handleHistoryFiltersChange(filters: ReviewHistoryFilters) {
    setHistoryFilters(filters);
  }

  function handleHistoryFiltersClear() {
    setHistoryFilters(emptyHistoryFilters);
  }

  async function handleReviewExport(format: ReportFormat) {
    if (!selectedHistoryReview) return;
    setIsReviewExporting(true);
    setReviewActionError(null);
    setReviewActionMessage(null);
    try {
      saveDownloadedReport(await exportReview(selectedHistoryReview.id, format));
      setReviewActionMessage(`${format === 'json' ? 'JSON' : 'Markdown'} report downloaded.`);
    } catch (error) {
      setReviewActionError(error instanceof Error ? error.message : 'Unable to export this review.');
    } finally {
      setIsReviewExporting(false);
    }
  }

  async function handleReviewPublish() {
    if (
      !selectedHistoryReview ||
      !window.confirm('Publish this PullSight review as a comment on the GitHub pull request?')
    ) {
      return;
    }

    setIsReviewPublishing(true);
    setReviewActionError(null);
    setReviewActionMessage(null);
    try {
      const result = await publishReview(selectedHistoryReview.id);
      setReviewActionMessage(
        `GitHub comment ${result.status}.`,
      );
    } catch (error) {
      setReviewActionError(error instanceof Error ? error.message : 'Unable to publish this review.');
    } finally {
      setIsReviewPublishing(false);
    }
  }

  async function handleComparisonExport(format: ReportFormat) {
    if (!reviewComparison) return;
    setIsComparisonExporting(true);
    setComparisonActionError(null);
    setComparisonActionMessage(null);
    try {
      saveDownloadedReport(
        await exportComparison(reviewComparison.baseRun.id, reviewComparison.targetRun.id, format),
      );
      setComparisonActionMessage(`${format === 'json' ? 'JSON' : 'Markdown'} comparison downloaded.`);
    } catch (error) {
      setComparisonActionError(
        error instanceof Error ? error.message : 'Unable to export this comparison.',
      );
    } finally {
      setIsComparisonExporting(false);
    }
  }

  async function handleComparisonPublish() {
    if (
      !reviewComparison ||
      !window.confirm('Publish this PullSight comparison as a comment on the GitHub pull request?')
    ) {
      return;
    }

    setIsComparisonPublishing(true);
    setComparisonActionError(null);
    setComparisonActionMessage(null);
    try {
      const result = await publishComparison(
        reviewComparison.baseRun.id,
        reviewComparison.targetRun.id,
      );
      setComparisonActionMessage(`GitHub comparison comment ${result.status}.`);
    } catch (error) {
      setComparisonActionError(
        error instanceof Error ? error.message : 'Unable to publish this comparison.',
      );
    } finally {
      setIsComparisonPublishing(false);
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
      <Sidebar activeView={activeView} authUser={authUser} />

      <main className="workspace" id={activeView}>
        <Topbar
          authUser={authUser}
          eyebrow={activeView === 'recent' ? 'Saved review intelligence' : undefined}
          title={activeView === 'recent' ? 'Review history across commits' : undefined}
          showRepositoryRefresh={activeView === 'reviews'}
          isAuthLoading={isAuthLoading || isLoginRedirecting}
          isRefreshingRepositories={isRepositoryLoading}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onRefreshRepositories={loadRepositories}
        />

        {activeView === 'reviews' ? (
          <>
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
          </>
        ) : (
          <>
            <RecentReviews
              detailError={historyDetailError}
              error={historyError}
              history={reviewHistory}
              isDetailLoading={isHistoryDetailLoading}
              isLoading={isHistoryLoading}
              selectedReview={selectedHistoryReview}
              comparisonSelection={comparisonSelection}
              filters={historyFilters}
              repositories={availableRepositories}
              isExporting={isReviewExporting}
              isPublishing={isReviewPublishing}
              actionMessage={reviewActionMessage}
              actionError={reviewActionError}
              onPageChange={loadReviewHistory}
              onReviewSelect={handleHistoryReviewSelect}
              onComparisonToggle={handleComparisonToggle}
              onFiltersChange={handleHistoryFiltersChange}
              onFiltersClear={handleHistoryFiltersClear}
              onExport={handleReviewExport}
              onPublish={handleReviewPublish}
            />

            <CompareReviews
              comparison={reviewComparison}
              error={comparisonError}
              isLoading={isComparisonLoading}
              isExporting={isComparisonExporting}
              isPublishing={isComparisonPublishing}
              actionMessage={comparisonActionMessage}
              actionError={comparisonActionError}
              selectedReviews={comparisonSelection}
              onClear={handleComparisonClear}
              onCompare={handleCompareReviews}
              onExport={handleComparisonExport}
              onPublish={handleComparisonPublish}
            />
          </>
        )}
      </main>
    </div>
  );
}

function getViewFromHash(): DashboardView {
  return window.location.hash === '#recent' ? 'recent' : 'reviews';
}

const emptyHistoryFilters: ReviewHistoryFilters = {
  repository: '',
  pullRequestNumber: '',
  source: '',
  status: '',
};
