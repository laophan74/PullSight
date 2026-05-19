import type { Severity } from '../types';

export const severityOrder: Severity[] = ['critical', 'high', 'medium', 'low'];

export const severityLabel: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};
