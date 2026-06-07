import { GitPullRequestArrow, Loader2, LogOut, RefreshCw } from 'lucide-react';
import type { AuthUser } from '../../services/auth';

type TopbarProps = {
  authUser: AuthUser | null;
  eyebrow?: string;
  title?: string;
  showRepositoryRefresh?: boolean;
  isAuthLoading: boolean;
  isRefreshingRepositories?: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onRefreshRepositories: () => void;
};

export function Topbar({
  authUser,
  eyebrow = 'Pull request intelligence',
  title = 'Review risk before merge',
  showRepositoryRefresh = true,
  isAuthLoading,
  isRefreshingRepositories = false,
  onLogin,
  onLogout,
  onRefreshRepositories,
}: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        {showRepositoryRefresh ? (
          <button
            className="icon-button"
            type="button"
            aria-label="Refresh repositories"
            onClick={onRefreshRepositories}
            disabled={!authUser || isRefreshingRepositories}
          >
            <RefreshCw className={isRefreshingRepositories ? 'spin-icon' : undefined} size={18} />
          </button>
        ) : null}
        {authUser ? (
          <button className="secondary-button" type="button" onClick={onLogout}>
            <LogOut size={18} />
            Logout
          </button>
        ) : (
          <button className="primary-button" type="button" onClick={onLogin} disabled={isAuthLoading}>
            {isAuthLoading ? (
              <Loader2 className="spin-icon" size={18} />
            ) : (
              <GitPullRequestArrow size={18} />
            )}
            {isAuthLoading ? 'Connecting GitHub' : 'Login with GitHub'}
          </button>
        )}
      </div>
    </header>
  );
}
