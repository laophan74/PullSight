import { ChevronLeft, ChevronRight, Clock3, History, LoaderCircle } from 'lucide-react';
import type { ReviewHistoryDetail, ReviewHistoryItem, ReviewHistoryPage } from '../../types';
import { FindingsList } from './FindingsList';

type RecentReviewsProps = {
  history: ReviewHistoryPage | null;
  selectedReview: ReviewHistoryDetail | null;
  isLoading: boolean;
  isDetailLoading: boolean;
  error: string | null;
  detailError: string | null;
  comparisonSelection: ReviewHistoryItem[];
  onPageChange: (page: number) => void;
  onReviewSelect: (reviewId: string) => void;
  onComparisonToggle: (review: ReviewHistoryItem) => void;
};

export function RecentReviews({
  history,
  selectedReview,
  isLoading,
  isDetailLoading,
  error,
  detailError,
  comparisonSelection,
  onPageChange,
  onReviewSelect,
  onComparisonToggle,
}: RecentReviewsProps) {
  return (
    <section className="history-section" id="recent-reviews" aria-labelledby="recent-reviews-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Saved results</p>
          <h2 id="recent-reviews-title">Recent reviews</h2>
        </div>
        {history ? <span className="history-count">{history.totalCount} saved</span> : null}
      </div>

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
          Analyze a pull request to create your first saved review.
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
                        {selectedReview.source} / {selectedReview.status}
                      </p>
                      <h3>
                        {selectedReview.repositoryFullName} PR #{selectedReview.pullRequestNumber}
                      </h3>
                    </div>
                    <span className={`risk-badge risk-${getRiskLevel(selectedReview.riskScore)}`}>
                      Risk {selectedReview.riskScore}
                    </span>
                  </div>
                  <p className="review-summary">{selectedReview.summary}</p>
                  <div className="history-detail-meta">
                    <span>{selectedReview.analyzer}</span>
                    <code>{selectedReview.headSha}</code>
                  </div>
                  <FindingsList findings={selectedReview.findings} />
                </>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function getRiskLevel(score: number) {
  if (score >= 70) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}
