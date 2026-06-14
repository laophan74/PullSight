import { ChevronLeft, ChevronRight, Clock3, History, LoaderCircle } from 'lucide-react';
import type {
  InlinePublishStatus,
  ReviewHistoryDetail,
  ReviewHistoryItem,
  ReviewHistoryPage,
} from '../../types';
import type { ReportFormat, Repository, ReviewHistoryFilters } from '../../types';
import { FindingsList } from './FindingsList';
import { ReportActions } from './ReportActions';
import { ReviewHistoryFiltersBar } from './ReviewHistoryFilters';
import { ReviewStatusBadge } from './ReviewStatusBadge';
import { ReviewSummaryCard } from './ReviewSummaryCard';

type RecentReviewsProps = {
  history: ReviewHistoryPage | null;
  selectedReview: ReviewHistoryDetail | null;
  isLoading: boolean;
  isDetailLoading: boolean;
  error: string | null;
  detailError: string | null;
  comparisonSelection: ReviewHistoryItem[];
  filters: ReviewHistoryFilters;
  repositories: Repository[];
  isExporting: boolean;
  isPublishing: boolean;
  isPublishingCheck: boolean;
  isRetrying: boolean;
  isPublishingImportant: boolean;
  inlinePublishStates: Record<string, { status: InlinePublishStatus; message?: string | null }>;
  actionMessage: string | null;
  actionError: string | null;
  onPageChange: (page: number) => void;
  onReviewSelect: (reviewId: string) => void;
  onComparisonToggle: (review: ReviewHistoryItem) => void;
  onFiltersChange: (filters: ReviewHistoryFilters) => void;
  onFiltersClear: () => void;
  onExport: (format: ReportFormat) => void;
  onPublish: () => void;
  onPublishCheck: () => void;
  onRetry: () => void;
  onPublishFinding: (findingId: string) => void;
  onPublishImportant: () => void;
};

export function RecentReviews({
  history,
  selectedReview,
  isLoading,
  isDetailLoading,
  error,
  detailError,
  comparisonSelection,
  filters,
  repositories,
  isExporting,
  isPublishing,
  isPublishingCheck,
  isRetrying,
  isPublishingImportant,
  inlinePublishStates,
  actionMessage,
  actionError,
  onPageChange,
  onReviewSelect,
  onComparisonToggle,
  onFiltersChange,
  onFiltersClear,
  onExport,
  onPublish,
  onPublishCheck,
  onRetry,
  onPublishFinding,
  onPublishImportant,
}: RecentReviewsProps) {
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <section className="history-section" id="recent-reviews" aria-labelledby="recent-reviews-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Saved results</p>
          <h2 id="recent-reviews-title">Recent reviews</h2>
        </div>
        {history ? <span className="history-count">{history.totalCount} saved</span> : null}
      </div>

      <ReviewHistoryFiltersBar
        disabled={isLoading}
        filters={filters}
        onChange={onFiltersChange}
        onClear={onFiltersClear}
        repositories={repositories}
      />

      {isLoading ? (
        <div className="history-state">
          <LoaderCircle className="spin-icon" size={20} />
          Loading review history...
        </div>
      ) : null}

      {!isLoading && error ? <p className="history-state error">{error}</p> : null}

      {!isLoading && !error && history?.items.length === 0 ? (
        <div className="history-state">
          <History size={20} />
          {hasFilters
            ? 'No saved reviews match these filters.'
            : 'Analyze a pull request to create your first saved review.'}
        </div>
      ) : null}

      {!isLoading && !error && !history ? (
        <div className="history-state">
          <History size={20} />
          Login with GitHub to view your saved reviews.
        </div>
      ) : null}

      {!isLoading && !error && history && history.items.length > 0 ? (
        <>
          <div className="history-grid">
            <div className="history-list">
              <div
                aria-label="Saved review runs"
                className="history-scroll"
                role="region"
                tabIndex={0}
              >
                {history.items.map((review) => (
                  <article
                    className={`history-item ${selectedReview?.id === review.id ? 'active' : ''}`}
                    key={review.id}
                  >
                    <div className="history-item-title">
                      <strong>{review.repositoryFullName}</strong>
                      <span>PR #{review.pullRequestNumber}</span>
                    </div>
                    <span className="history-item-meta">
                      <ReviewStatusBadge status={review.status} />
                      <span className={`risk-badge risk-${getRiskLevel(review.riskScore)}`}>
                        Risk {review.riskScore}
                      </span>
                      <span>{review.findingCount} findings</span>
                      <span>{review.analyzer}</span>
                    </span>
                    <span className="history-item-time">
                      <Clock3 size={14} />
                      {formatDate(review.createdAt)}
                    </span>
                    <div className="history-item-actions">
                      <label>
                        <input
                          checked={comparisonSelection.some((item) => item.id === review.id)}
                          disabled={!isComplete(review.status)}
                          onChange={() => onComparisonToggle(review)}
                          type="checkbox"
                        />
                        Compare
                      </label>
                      <button
                        aria-label={`Open review for ${review.repositoryFullName} pull request ${review.pullRequestNumber}`}
                        onClick={() => onReviewSelect(review.id)}
                        type="button"
                      >
                        Open
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {history.totalPages > 1 ? (
                <div className="history-pagination">
                  <button
                    aria-label="Previous review history page"
                    disabled={history.page <= 1}
                    onClick={() => onPageChange(history.page - 1)}
                    type="button"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span>
                    Page {history.page} of {history.totalPages}
                  </span>
                  <button
                    aria-label="Next review history page"
                    disabled={history.page >= history.totalPages}
                    onClick={() => onPageChange(history.page + 1)}
                    type="button"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              ) : null}
            </div>

            <div className="history-detail">
              {isDetailLoading ? (
                <div className="history-state">
                  <LoaderCircle className="spin-icon" size={20} />
                  Opening saved review...
                </div>
              ) : null}
              {!isDetailLoading && detailError ? (
                <p className="history-state error">{detailError}</p>
              ) : null}
              {!isDetailLoading && !detailError && !selectedReview ? (
                <div className="history-state">Select a review to reopen its summary and findings.</div>
              ) : null}
              {!isDetailLoading && !detailError && selectedReview ? (
                <>
                  <div className="section-heading compact">
                    <div>
                      <p className="eyebrow">
                        {selectedReview.source} / <ReviewStatusBadge status={selectedReview.status} />
                      </p>
                      <h3>
                        {selectedReview.repositoryFullName} PR #{selectedReview.pullRequestNumber}
                      </h3>
                    </div>
                    <span className={`risk-badge risk-${getRiskLevel(selectedReview.riskScore)}`}>
                      Risk {selectedReview.riskScore}
                    </span>
                  </div>
                  <ReviewSummaryCard summary={selectedReview.summaryDetails} />
                  {selectedReview.status === 'failed' && selectedReview.errorMessage ? (
                    <p className="failed-review-message" role="alert">
                      {selectedReview.errorMessage}
                    </p>
                  ) : null}
                  <div className="history-detail-meta">
                    <span>{selectedReview.analyzer}</span>
                    <code>{selectedReview.headSha}</code>
                  </div>
                  <ReportActions
                    disabled={!isComplete(selectedReview.status)}
                    error={actionError}
                    isExporting={isExporting}
                    isPublishing={isPublishing}
                    isPublishingCheck={isPublishingCheck}
                    label="saved review"
                    message={actionMessage}
                    onExport={onExport}
                    onPublish={onPublish}
                    onPublishCheck={onPublishCheck}
                  />
                  {selectedReview.status === 'failed' ? (
                    <button
                      className="secondary-button retry-review"
                      disabled={isRetrying}
                      onClick={onRetry}
                      type="button"
                    >
                      {isRetrying ? 'Retrying...' : 'Retry / Reanalyze'}
                    </button>
                  ) : null}
                  {isComplete(selectedReview.status) &&
                  selectedReview.findings.some(
                    (finding) =>
                      finding.isInlineCommentable &&
                      (finding.severity === 'critical' || finding.severity === 'high'),
                  ) ? (
                    <button
                      className="secondary-button publish-important"
                      disabled={isPublishingImportant}
                      onClick={onPublishImportant}
                      type="button"
                    >
                      {isPublishingImportant
                        ? 'Publishing important findings...'
                        : 'Publish important findings'}
                    </button>
                  ) : null}
                  <FindingsList
                    findings={selectedReview.findings}
                    onPublish={isComplete(selectedReview.status) ? onPublishFinding : undefined}
                    publishStates={inlinePublishStates}
                  />
                </>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

function isComplete(status: ReviewHistoryItem['status']) {
  return status === 'completed' || status === 'fallback';
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function getRiskLevel(score: number) {
  if (score >= 70) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}
