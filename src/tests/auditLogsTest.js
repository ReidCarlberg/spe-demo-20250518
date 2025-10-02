/**
 * Audit Logs Test
 *
 * Manual test helper for querying Graph audit records related to file modifications
 * in the admin section context. Uses the new AuditLogsService.
 *
 * Example (from console after app loads & user authenticated):
 *   window.runAuditLogsTest();
 */

import { speService } from '../services';

/**
 * Runs a test query for audit records for the target file Automobile_Industry_1969.docx
 * Adjust activities or top as needed.
 */
export async function runAuditLogsTest() {
  console.log('[AuditLogsTest] Starting audit logs test...');
  try {
    const fileName = 'Automobile_Industry_1969.docx';
    const { value, raw } = await speService.queryFileModificationAuditLogs({ fileName, top: 10 });
    console.log(`[AuditLogsTest] Retrieved ${value.length} audit record(s) for`, fileName);
    value.forEach((rec, i) => {
      console.log(`Record ${i + 1}:`, {
        id: rec.id,
        activityDateTime: rec.activityDateTime,
        activityDisplayName: rec.activityDisplayName,
        targetResourceName: rec.targetResourceName,
        initiatedBy: rec.initiatedBy?.user?.displayName || rec.initiatedBy?.user?.id,
        additionalDetails: rec.additionalDetails?.slice?.(0,5) // show a subset
      });
    });
    // Sample shape expectation (mirrors provided example)
    if (value.length) {
      const sample = value[0];
      const hasRequired = sample.activityDisplayName && sample.targetResourceName;
      console.log('[AuditLogsTest] Basic shape validation:', hasRequired ? '✅ passed' : '⚠️ missing fields');
    }
    return value;
  } catch (err) {
    console.error('[AuditLogsTest] Failed:', err.message, err);
    throw err;
  }
}

// Expose convenience global for quick manual invocation
// (mirrors pattern in other test helpers)
window.runAuditLogsTest = runAuditLogsTest;

export default runAuditLogsTest;
