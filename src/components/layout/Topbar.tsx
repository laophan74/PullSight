import { GitPullRequestArrow, Loader2, LogOut, RefreshCw } from 'lucide-react';
import type { AuthUser } from '../../services/auth';

type TopbarProps = {
  authUser: AuthUser | null;
  isAuthLoading: boolean;
  isRefreshingRepositories?: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onRefreshRepositories: () => void;
};

export function Topbar({
  authUser,
  isAuthLoading,
  isRefreshingRepositories = false,
  onLogin,
  onLogout,
  onRefreshRepositories,
}: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Pull request intelligence</p>
        <h1>Review risk before merge</h1>
      </div>
      <div className="topbar-actions">
        <button
          className="icon-button"
          type="button"
          aria-label="Refresh repositories"
          onClick={onRefreshRepositories}
          disabled={!authUser || isRefreshingRepositories}
        >
          <RefreshCw className={isRefreshingRepositories ? 'spin-icon' : undefined} size={18} />
        </button>
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
