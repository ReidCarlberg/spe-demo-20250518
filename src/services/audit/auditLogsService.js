import { GraphApiClient } from '../shared/graphApiClient.js';
import { GRAPH_ENDPOINTS } from '../shared/constants.js';

/**
 * Service for querying Microsoft 365 (Graph) audit records relevant to SPE scenarios.
 * Now supports querying by time window (last X hours) for modification events.
 */
export class AuditLogsService {
  /**
   * Query directory audit logs for file modification events within the last N hours.
   * @param {Object} options
   * @param {number} options.hours Lookback window in hours (e.g., 24, 48, 72)
   * @param {string} [options.activity='FileModified'] Activity display name to filter on
   * @param {number} [options.top=50] Page size (default 50)
   * @returns {Promise<{ value: Array, raw: Object, from: string }>} records and the computed start ISO timestamp
   */
  static async queryRecentFileModificationAuditLogs({ hours, activity = 'FileModified', top = 50 }) {
    if (!hours || hours <= 0) throw new Error('hours must be a positive number');
    const fromDateIso = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    // Filter only by activity + time >= fromDate
    const filter = `activityDateTime ge ${fromDateIso} and activityDisplayName eq '${activity}'`;
  const url = `${GRAPH_ENDPOINTS.DIRECTORY_AUDITS}?$filter=${encodeURIComponent(filter)}&$top=${top}`;
    const data = await GraphApiClient.get(url);
    return { value: data.value || [], raw: data, from: fromDateIso };
  }
}
