import { AlertTriangle, LoaderCircle, MessageSquareText } from 'lucide-react';
import { severityLabel } from '../../constants/review';
import type { InlinePublishStatus, ReviewFinding } from '../../types';

type FindingItemProps = {
  finding: ReviewFinding;
  publishStatus?: InlinePublishStatus;
  publishMessage?: string | null;
  onPublish?: (findingId: string) => void;
};

export function FindingItem({
  finding,
  publishStatus,
  publishMessage,
  onPublish,
}: FindingItemProps) {
  return (
    <article className={`finding ${finding.severity}`}>
      <div className="finding-icon">
        <AlertTriangle size={18} />
      </div>
      <div className="finding-body">
        <div className="finding-title-row">
          <h3>{finding.title}</h3>
          <span>{severityLabel[finding.severity]}</span>
        </div>
        <p>{finding.detail}</p>
        <div className="finding-meta">
          <code>
            {finding.filePath}:{finding.line}
          </code>
          <small>{finding.source === 'ai' ? 'AI finding' : 'Rule finding'}</small>
        </div>
        {finding.suggestion ? <p className="finding-suggestion">Suggested fix: {finding.suggestion}</p> : null}
        {onPublish ? (
          <div className="finding-publish">
            <button
              aria-label={`Publish inline comment for ${finding.title}`}
              className="secondary-button"
              disabled={!finding.isInlineCommentable || publishStatus === 'publishing'}
              onClick={() => onPublish(finding.id)}
              type="button"
            >
              {publishStatus === 'publishing' ? (
                <LoaderCircle className="spin-icon" aria-hidden="true" size={15} />
              ) : (
                <MessageSquareText aria-hidden="true" size={15} />
              )}
              {publishStatus === 'publishing' ? 'Publishing...' : 'Publish finding'}
            </button>
            {!finding.isInlineCommentable ? (
              <small>Inline publishing requires a valid changed file and added line.</small>
            ) : null}
            {publishStatus && publishStatus !== 'publishing' ? (
              <small className={publishStatus === 'failed' ? 'inline-error' : 'inline-success'}>
                {publishMessage ?? publishStatus}
              </small>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
