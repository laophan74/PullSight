import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ReviewControls } from './components/review/ReviewControls';
import { ReviewMetrics } from './components/review/ReviewMetrics';
import { ReviewPanel } from './components/review/ReviewPanel';
import { ReviewSidebar } from './components/review/ReviewSidebar';
import { pullRequestsByRepo, repositories, reviewRun } from './data/mockReviewData';
import { getGitHubLoginUrl } from './services/api';
import { getCurrentUser, logout, type AuthUser } from './services/auth';
import { getPullRequests } from './services/pullRequests';
import { getRepositories } from './services/repositories';
import { analyzePullRequest } from './services/reviews';
import type { PullRequest, PullRequestDiff, Repository, ReviewRun, Severity } from './types';
import { getFilteredFindings } from './utils/review';

export function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginRedirecting, setIsLoginRedirecting] = useState(false);
  const [availableRepositories, setAvailableRepositories] = useState<Repository[]>(repositories);
  const [isRepositoryLoading, setIsRepositoryLoading] = useState(false);
  const [repositoryError, setRepositoryError] = useState<string | null>(null);
  const [availablePullRequests, setAvailablePullRequests] = useState<PullRequest[]>(
    pullRequestsByRepo[repositories[0].id] ?? [],
  );
  const [isPullRequestLoading, setIsPullRequestLoading] = useState(false);
  const [pullRequestError, setPullRequestError] = useState<string | null>(null);
  const [pullRequestDiff, setPullRequestDiff] = useState<PullRequestDiff | null>(null);
  const [currentReviewRun, setCurrentReviewRun] = useState<ReviewRun>(reviewRun);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedRepoId, setSelectedRepoId] = useState<number | undefined>(repositories[0].id);
  const selectedRepo =
    availableRepositories.find((repo) => repo.id === selectedRepoId) ?? availableRepositories[0];
  const [selectedPrId, setSelectedPrId] = useState<number | undefined>(
    availablePullRequests[0]?.id,
  );
  const selectedPr =
    availablePullRequests.find((pr) => pr.id === selectedPrId) ?? availablePullRequests[0];
  const [activeSeverity, setActiveSeverity] = useState<Severity | 'all'>('all');

  const filteredFindings = useMemo(
    () => getFilteredFindings(currentReviewRun.findings, activeSeverity),
    [activeSeverity, currentReviewRun.findings],
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
      const firstDemoRepo = repositories[0];

      setAvailableRepositories(repositories);
      setRepositoryError(null);
      setSelectedRepoId(firstDemoRepo?.id);
      return;
    }

    setAvailableRepositories([]);
    setSelectedRepoId(undefined);
    setAvailablePullRequests([]);
    setSelectedPrId(undefined);
    void loadRepositories();
  }, [authUser]);

  useEffect(() => {
    setPullRequestDiff(null);
    setAnalysisError(null);
    setCurrentReviewRun(reviewRun);
  }, [selectedRepo?.id, selectedPr?.id]);

  useEffect(() => {
    if (!selectedRepo) {
      setAvailablePullRequests([]);
      setSelectedPrId(undefined);
      setPullRequestError(null);
      return;
    }

    if (!authUser) {
      const demoPullRequests = pullRequestsByRepo[selectedRepo.id] ?? [];

      setAvailablePullRequests(demoPullRequests);
      setSelectedPrId(demoPullRequests[0]?.id);
      setPullRequestError(null);
      return;
    }

    void loadPullRequests(selectedRepo);
  }, [authUser, selectedRepo?.id]);

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
          <ReviewSidebar />
        </section>
      </main>
    </div>
  );
}
