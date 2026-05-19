import {
  CheckCircle2,
  Database,
  FileDiff,
  GitBranch,
  GitPullRequestArrow,
  ShieldCheck,
} from 'lucide-react';

export function Sidebar() {
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
        <a className="nav-item active" href="#dashboard">
          <FileDiff aria-hidden="true" size={18} />
          Reviews
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
          <div className="avatar">D</div>
          <div>
            <strong>duydev</strong>
            <span>Connected</span>
          </div>
          <CheckCircle2 aria-label="Connected" size={18} />
        </div>
      </div>
    </aside>
  );
}
