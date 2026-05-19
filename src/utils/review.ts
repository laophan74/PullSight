import type { ReviewFinding, Severity } from '../types';

export function getSeverityCount(findings: ReviewFinding[], severity: Severity) {
  return findings.filter((finding) => finding.severity === severity).length;
}

export function getFilteredFindings(
  findings: ReviewFinding[],
  activeSeverity: Severity | 'all',
) {
  if (activeSeverity === 'all') {
    return findings;
  }

  return findings.filter((finding) => finding.severity === activeSeverity);
}
