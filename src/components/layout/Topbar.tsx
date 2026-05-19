import { GitPullRequestArrow, LogOut, RefreshCw } from 'lucide-react';
import type { AuthUser } from '../../services/auth';

type TopbarProps = {
  authUser: AuthUser | null;
  isAuthLoading: boolean;
  onLogin: () => void;
  onLogout: () => void;
};

export function Topbar({ authUser, isAuthLoading, onLogin, onLogout }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Pull request intelligence</p>
        <h1>Review risk before merge</h1>
      </div>
      <div className="topbar-actions">
        <button className="icon-button" type="button" aria-label="Refresh repositories">
          <RefreshCw size={18} />
        </button>
        {authUser ? (
          <>
            <a className="user-chip" href={authUser.profileUrl} target="_blank" rel="noreferrer">
              <img src={authUser.avatarUrl} alt="" />
              <span>{authUser.login}</span>
            </a>
            <button className="secondary-button" type="button" onClick={onLogout}>
              <LogOut size={18} />
              Logout
            </button>
          </>
        ) : (
          <button className="primary-button" type="button" onClick={onLogin} disabled={isAuthLoading}>
            <GitPullRequestArrow size={18} />
            {isAuthLoading ? 'Checking GitHub' : 'Login with GitHub'}
          </button>
        )}
      </div>
    </header>
  );
}
