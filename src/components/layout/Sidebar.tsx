import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Database,
  FileDiff,
  GitBranch,
  GitPullRequestArrow,
  History,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { AuthUser } from '../../services/auth';

export type DashboardView = 'reviews' | 'recent';

type SidebarProps = {
  authUser: AuthUser | null;
  activeView: DashboardView;
};

export function Sidebar({ authUser, activeView }: SidebarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <aside className={`sidebar ${isMenuOpen ? 'menu-open' : ''}`} aria-label="PullSight navigation">
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-mark">
            <GitBranch aria-hidden="true" size={22} />
          </div>
          <div>
            <strong>PullSight</strong>
            <span>AI PR Review</span>
          </div>
        </div>

        <button
          aria-controls="primary-navigation"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="menu-button"
          onClick={() => setIsMenuOpen((current) => !current)}
          type="button"
        >
          {isMenuOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
        </button>
      </div>

      <nav className="nav-list" id="primary-navigation" aria-label="Primary">
        <a
          aria-current={activeView === 'reviews' ? 'page' : undefined}
          className={`nav-item ${activeView === 'reviews' ? 'active' : ''}`}
          href="#reviews"
          onClick={closeMenu}
        >
          <FileDiff aria-hidden="true" size={18} />
          Reviews
        </a>
        <a
          aria-current={activeView === 'recent' ? 'page' : undefined}
          className={`nav-item ${activeView === 'recent' ? 'active' : ''}`}
          href="#recent"
          onClick={closeMenu}
        >
          <History aria-hidden="true" size={18} />
          Recent
        </a>
        <a className="nav-item" href="#repositories" onClick={closeMenu}>
          <GitPullRequestArrow aria-hidden="true" size={18} />
          Repositories
        </a>
        <a className="nav-item" href="#quota" onClick={closeMenu}>
          <ShieldCheck aria-hidden="true" size={18} />
          Quota
        </a>
        <a className="nav-item" href="#storage" onClick={closeMenu}>
          <Database aria-hidden="true" size={18} />
          Storage
        </a>
      </nav>

      <div className="connection-panel">
        <span className="eyebrow">GitHub OAuth</span>
        <div className="user-row">
          {authUser?.avatarUrl ? (
            <img className="avatar image-avatar" src={authUser.avatarUrl} alt="" />
          ) : (
            <div className="avatar">{authUser?.login?.[0]?.toUpperCase() ?? 'G'}</div>
          )}
          <div>
            <strong>{authUser?.name || authUser?.login || 'Not connected'}</strong>
            {authUser?.name ? <span>@{authUser.login}</span> : null}
            <span>{authUser ? 'Connected' : 'Login required'}</span>
          </div>
          {authUser ? <CheckCircle2 aria-label="Connected" size={18} /> : null}
        </div>
      </div>
    </aside>
  );
}
