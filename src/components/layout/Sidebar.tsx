import {
  CheckCircle2,
  Database,
  FileDiff,
  GitBranch,
  GitPullRequestArrow,
  History,
  ShieldCheck,
} from 'lucide-react';
import type { AuthUser } from '../../services/auth';

export type DashboardView = 'reviews' | 'recent';

type SidebarProps = {
  authUser: AuthUser | null;
  activeView: DashboardView;
};

export function Sidebar({ authUser, activeView }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="PullSight navigation">
      <div className="brand">
        <div className="brand-mark">
          <GitBranch aria-hidden="true" size={22} />
        </div>
        <div>
          <strong>PullSight</strong>
          <span>AI PR Review</span>
        </div>
      </div>

      <nav className="nav-list" aria-label="Primary">
        <a
          aria-current={activeView === 'reviews' ? 'page' : undefined}
          className={`nav-item ${activeView === 'reviews' ? 'active' : ''}`}
          href="#reviews"
        >
          <FileDiff aria-hidden="true" size={18} />
          Reviews
        </a>
        <a
          aria-current={activeView === 'recent' ? 'page' : undefined}
          className={`nav-item ${activeView === 'recent' ? 'active' : ''}`}
          href="#recent"
        >
          <History aria-hidden="true" size={18} />
          Recent
        </a>
        <a className="nav-item" href="#repositories">
          <GitPullRequestArrow aria-hidden="true" size={18} />
          Repositories
        </a>
        <a className="nav-item" href="#quota">
          <ShieldCheck aria-hidden="true" size={18} />
          Quota
        </a>
        <a className="nav-item" href="#storage">
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
            <strong>{authUser?.login ?? 'Not connected'}</strong>
            <span>{authUser ? 'Connected' : 'Login required'}</span>
          </div>
          {authUser ? <CheckCircle2 aria-label="Connected" size={18} /> : null}
        </div>
      </div>
    </aside>
  );
}
