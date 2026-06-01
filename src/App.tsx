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
import { getRepositories } from './services/repositories';
import type { Repository, Severity } from './types';
import { getFilteredFindings } from './utils/review';

export function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginRedirecting, setIsLoginRedirecting] = useState(false);
  const [availableRepositories, setAvailableRepositories] = useState<Repository[]>(repositories);
  const [isRepositoryLoading, setIsRepositoryLoading] = useState(false);
  const [repositoryError, setRepositoryError] = useState<string | null>(null);
  const [selectedRepoId, setSelectedRepoId] = useState<number | undefined>(repositories[0].id);
  const selectedRepo =
    availableRepositories.find((repo) => repo.id === selectedRepoId) ?? availableRepositories[0];
  const pullRequests = selectedRepo ? (pullRequestsByRepo[selectedRepo.id] ?? []) : [];
  const [selectedPrId, setSelectedPrId] = useState<number | undefined>(pullRequests[0]?.id);
  const selectedPr = pullRequests.find((pr) => pr.id === selectedPrId) ?? pullRequests[0];
  const [activeSeverity, setActiveSeverity] = useState<Severity | 'all'>('all');

  const filteredFindings = useMemo(
    () => getFilteredFindings(reviewRun.findings, activeSeverity),
    [activeSeverity],
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
      setSelectedPrId(firstDemoRepo ? pullRequestsByRepo[firstDemoRepo.id]?.[0]?.id : undefined);
      return;
    }

    void loadRepositories();
  }, [authUser]);

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
      setSelectedPrId(undefined);
    } catch (error) {
      setRepositoryError(error instanceof Error ? error.message : 'Unable to load repositories.');
    } finally {
      setIsRepositoryLoading(false);
    }
  }

  function handleRepoChange(repoId: number) {
    const nextPullRequests = pullRequestsByRepo[repoId] ?? [];

    setSelectedRepoId(repoId);
    setSelectedPrId(nextPullRequests[0]?.id);
  }

  function handleLogin() {
    setIsLoginRedirecting(true);
    window.location.assign(getGitHubLoginUrl());
  }

  async function handleLogout() {
    await logout();
    setAuthUser(null);
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
          pullRequests={pullRequests}
          selectedPr={selectedPr}
          onRepoSelect={handleRepoChange}
          onPrSelect={setSelectedPrId}
        />

        <ReviewMetrics pullRequest={selectedPr} reviewRun={reviewRun} />

        <section className="review-layout">
          <ReviewPanel
            activeSeverity={activeSeverity}
            filteredFindings={filteredFindings}
            pullRequest={selectedPr}
            reviewRun={reviewRun}
            onSeverityChange={setActiveSeverity}
          />
          <ReviewSidebar />
        </section>
      </main>
    </div>
  );
}
