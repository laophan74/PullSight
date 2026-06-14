import { Download, LoaderCircle, Send } from 'lucide-react';
import type { ReportFormat } from '../../types';

type ReportActionsProps = {
  label: string;
  disabled: boolean;
  isExporting: boolean;
  isPublishing: boolean;
  message: string | null;
  error: string | null;
  onExport: (format: ReportFormat) => void;
  onPublish: () => void;
};

export function ReportActions({
  label,
  disabled,
  isExporting,
  isPublishing,
  message,
  error,
  onExport,
  onPublish,
}: ReportActionsProps) {
  return (
    <div className="report-actions">
      <div className="report-action-buttons">
        <label>
          <span className="sr-only">{label} export format</span>
          <select
            aria-label={`${label} export format`}
            disabled={disabled || isExporting}
            onChange={(event) => onExport(event.target.value as ReportFormat)}
            value=""
          >
            <option disabled value="">
              Export
            </option>
            <option value="markdown">Markdown</option>
            <option value="json">JSON</option>
          </select>
        </label>
        <button
          aria-label={`Publish ${label} to GitHub`}
          className="secondary-button"
          disabled={disabled || isPublishing}
          onClick={onPublish}
          type="button"
        >
          {isPublishing ? (
            <LoaderCircle className="spin-icon" aria-hidden="true" size={16} />
          ) : (
            <Send aria-hidden="true" size={16} />
          )}
          {isPublishing ? 'Publishing...' : 'Publish to GitHub'}
        </button>
        {isExporting ? (
          <span className="action-progress">
            <Download aria-hidden="true" size={15} />
            Preparing download...
          </span>
        ) : null}
      </div>
      {message ? (
        <p className="action-message success" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="action-message error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
