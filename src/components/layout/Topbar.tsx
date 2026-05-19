import { GitPullRequestArrow, RefreshCw } from 'lucide-react';

export function Topbar() {
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
        <button className="primary-button" type="button">
          <GitPullRequestArrow size={18} />
          Login with GitHub
        </button>
      </div>
    </header>
  );
}
