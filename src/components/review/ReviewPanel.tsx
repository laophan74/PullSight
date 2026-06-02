import { Sparkles } from 'lucide-react';
import type { PullRequest, PullRequestDiff, ReviewFinding, ReviewRun, Severity } from '../../types';
import { FindingsList } from './FindingsList';
import { SeverityTabs } from './SeverityTabs';

type ReviewPanelProps = {
  activeSeverity: Severity | 'all';
  filteredFindings: ReviewFinding[];
  isAnalyzing?: boolean;
  analysisError?: string | null;
  pullRequest?: PullRequest;
  pullRequestDiff?: PullRequestDiff | null;
  reviewRun: ReviewRun;
  onSeverityChange: (severity: Severity | 'all') => void;
};

export function ReviewPanel({
  activeSeverity,
  filteredFindings,
  isAnalyzing = false,
  analysisError,
  pullRequest,
  pullRequestDiff,
  reviewRun,
  onSeverityChange,
}: ReviewPanelProps) {
  if (!pullRequest) {
    return (
      <article className="review-main empty-state">
        <div>
          <p className="eyebrow">Current review</p>
          <h2>Select an open pull request to continue</h2>
        </div>
        <p className="review-summary">
          PullSight now loads open pull requests from GitHub for the selected repository. Choose a
          PR above to review its details.
        </p>
      </article>
    );
  }

  return (
    <article className="review-main">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Current review</p>
          <h2>{pullRequest.title}</h2>
        </div>
        <span className={`status-pill ${reviewRun.status}`}>
          <Sparkles size={15} />
          {reviewRun.status}
        </span>
      </div>

      <p className="review-summary">{reviewRun.summary}</p>

      <section className="diff-summary" aria-label="Pull request diff">
        <div className="section-heading compact">
          <h3>Fetched diff</h3>
          {pullRequestDiff ? <span>{pullRequestDiff.files.length} files</span> : null}
        </div>
        {analysisError ? <p className="field-message error">{analysisError}</p> : null}
        {isAnalyzing ? <p className="field-message">Fetching changed files from GitHub...</p> : null}
        {!isAnalyzing && !analysisError && !pullRequestDiff ? (
          <p className="field-message">Click Analyze PR to fetch changed files, patches, and head SHA.</p>
        ) : null}
        {pullRequestDiff ? (
          <>
            <div className="diff-meta">
              <code>{pullRequestDiff.headSha}</code>
              <span>
                +{pullRequestDiff.additions} / -{pullRequestDiff.deletions}
              </span>
            </div>
            <div className="diff-file-list">
              {pullRequestDiff.files.map((file) => (
                <a
                  className="diff-file"
                  href={file.blobUrl}
                  key={`${file.sha}-${file.fileName}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span>
                    {file.fileName}
                    {file.previousFileName ? ` from ${file.previousFileName}` : ''}
                  </span>
                  <small>
                    {file.status} · +{file.additions} / -{file.deletions}
                    {file.patch ? ` · ${file.patch.split('\n').length} patch lines` : ''}
                  </small>
                </a>
              ))}
            </div>
          </>
        ) : null}
      </section>

      <SeverityTabs
        activeSeverity={activeSeverity}
        findings={reviewRun.findings}
        onChange={onSeverityChange}
      />

      <FindingsList findings={filteredFindings} />
    </article>
  );
}
