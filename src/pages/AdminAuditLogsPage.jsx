import { useState } from 'react';
import { Card, CardHeader, Button, Subtitle1, Spinner, Table, TableHeader, TableRow, TableCell, TableBody, Combobox, Option } from '@fluentui/react-components';
import { speService } from '../services';

/**
 * AdminAuditLogsPage
 * Simple UI to fetch file modification audit records for a recent time window using directoryAudits.
 */
const AdminAuditLogsPage = () => {
  // Store as string to align with Fluent UI Dropdown selectedOptions API
  const [hoursOption, setHoursOption] = useState('24'); // default selection
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);
  const [fromTimestamp, setFromTimestamp] = useState(null);

  const runQuery = async () => {
    setLoading(true); setError(null);
    try {
  const hours = parseInt(hoursOption, 10) || 24;
  const { value, from } = await speService.queryRecentFileModificationAuditLogs({ hours, top: 50 });
      setRecords(value);
      setFromTimestamp(from);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <h1>Audit Logs</h1>
  <p style={{ marginTop: 0 }}>Query Microsoft 365 directory audit logs (v1.0 /auditLogs/directoryAudits) for FileModified events within the selected lookback window.</p>
      <Card style={{ marginBottom: '1rem' }}>
        <CardHeader header={<Subtitle1>Query Parameters</Subtitle1>} />
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '.75rem', marginBottom: 4 }}>Lookback Window (Hours)</label>
            <Combobox
              aria-label="Lookback Window"
              selectedOptions={[hoursOption]}
              // Explicitly control the displayed value so the label always appears (Fluent UI sometimes keeps placeholder otherwise)
              value={hoursOption === '24' ? 'Last 24 Hours' : hoursOption === '48' ? 'Last 48 Hours' : hoursOption === '72' ? 'Last 72 Hours' : ''}
              onOptionSelect={(e, data) => {
                if (data.optionValue) {
                  setHoursOption(data.optionValue);
                }
              }}
              onChange={(e, data) => {
                // Prevent freeform edits: if user clears input treat as no selection
                if (!data.value) setHoursOption('');
              }}
              style={{ minWidth: 200 }}
              placeholder={hoursOption ? undefined : 'Select window'}
            >
              <Option value="24">Last 24 Hours</Option>
              <Option value="48">Last 48 Hours</Option>
              <Option value="72">Last 72 Hours</Option>
            </Combobox>
          </div>
          <Button appearance="primary" onClick={runQuery} disabled={loading}>Fetch Audit Records</Button>
          {loading && <Spinner size="tiny" />}        
        </div>
        {error && <p style={{ color: 'var(--colorStatusDangerForeground1,#b10e1e)', marginTop: '.75rem' }}>Error: {error}</p>}
        {fromTimestamp && !loading && !error && <p style={{ fontSize: '.7rem', opacity: .7, marginTop: '.5rem' }}>From (UTC): {fromTimestamp}</p>}
      </Card>

      <Card>
        <CardHeader header={<Subtitle1>Results ({records.length})</Subtitle1>} />
  {records.length === 0 && !loading && <p style={{ marginTop: 0 }}>No records returned for the selected window.</p>}
        {records.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <Table size="small" aria-label="Audit records table" style={{ minWidth: 900 }}>
              <TableHeader>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Activity</TableCell>
                  <TableCell>Date/Time (UTC)</TableCell>
                  <TableCell>Target Name</TableCell>
                  <TableCell>Initiated By</TableCell>
                  <TableCell>Details (First 2)</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map(r => {
                  const initiated = r?.initiatedBy?.user?.displayName || r?.initiatedBy?.user?.id || '—';
                  const details = (r.additionalDetails || []).slice(0,2).map(d => `${d.key}:${d.value}`).join('; ');
                  return (
                    <TableRow key={r.id}>
                      <TableCell style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.id}</TableCell>
                      <TableCell>{r.activityDisplayName}</TableCell>
                      <TableCell>{r.activityDateTime}</TableCell>
                      <TableCell>{r.targetResourceName}</TableCell>
                      <TableCell>{initiated}</TableCell>
                      <TableCell>{details}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminAuditLogsPage;
