import { Bot, Clock3, Lock } from 'lucide-react';

const fallbackRules = [
  'Missing authorization',
  'Raw SQL interpolation',
  'Large PR threshold',
  'Tests changed or absent',
  'Secrets and tokens',
];

export function ReviewSidebar() {
  return (
    <aside className="review-side" aria-label="Review context">
      <div className="side-section">
        <div className="section-heading compact">
          <h2>Pipeline</h2>
          <Clock3 size={18} />
        </div>
        <ol className="timeline">
          <li className="done">GitHub diff fetched</li>
          <li className="done">Cache checked by head SHA</li>
          <li className="done">AI review completed</li>
          <li>Persist findings to Supabase</li>
        </ol>
      </div>

      <div className="side-section">
        <div className="section-heading compact">
          <h2>Fallback rules</h2>
          <Bot size={18} />
        </div>
        <div className="rule-list">
          {fallbackRules.map((rule) => (
            <span key={rule}>{rule}</span>
          ))}
        </div>
      </div>

      <div className="side-section quiet" id="quota">
        <Lock size={18} />
        <p>
          Free-tier friendly by design: reviews run on demand, cache by PR head SHA, and fall back
          to static analysis when AI quota is unavailable.
        </p>
      </div>
    </aside>
  );
}
