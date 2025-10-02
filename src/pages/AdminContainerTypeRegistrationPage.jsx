import { useEffect, useState } from 'react';
import { speService } from '../speService';
import { Input, Field, Button, Spinner, Card, CardHeader, Subtitle1 } from '@fluentui/react-components';

// Simple recursive renderer for arbitrary JSON structures
const KeyValue = ({ value }) => {
  if (value === null) return <span style={{ color: '#666' }}>null</span>;
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') return <span>{String(value)}</span>;
  if (Array.isArray(value)) {
    if (value.length === 0) return <span>[]</span>;
    return (
      <ul style={{ margin: '2px 0 4px', paddingLeft: '1.1rem' }}>
        {value.map((v, i) => (
          <li key={i}><KeyValue value={v} /></li>
        ))}
      </ul>
    );
  }
  if (t === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return <span>{'{}'}</span>;
    return (
      <div style={{ borderLeft: '2px solid var(--colorNeutralStroke2,#ddd)', margin: '2px 0 4px .25rem', paddingLeft: '8px' }}>
        {entries.map(([k, v]) => (
          <div key={k} style={{ marginBottom: 2 }}>
            <strong style={{ fontWeight: 600 }}>{k}:</strong> <KeyValue value={v} />
          </div>
        ))}
      </div>
    );
  }
  return <span>{String(value)}</span>;
};

const AdminContainerTypeRegistrationPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [queryId, setQueryId] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const loadList = async () => {
    setLoading(true); setError(null);
    try {
      const list = await speService.listContainerTypeRegistrations();
      setItems(list);
    } catch (e) {
      setError(e.message || 'Failed to load container type registrations');
    } finally {
      setLoading(false);
    }
  };

  const fetchById = async () => {
    const id = queryId.trim();
    if (!id) { setDetail(null); setDetailError('Enter a registration ID'); return; }
    setDetailLoading(true); setDetailError(null); setDetail(null);
    try {
      const d = await speService.getContainerTypeRegistration(id);
      setDetail(d);
    } catch (e) {
      setDetailError(e.message || 'Failed to fetch registration');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => { loadList(); }, []);

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h1>Container Type Registrations</h1>
      <p style={{ marginTop: '-.5rem', fontSize: '.85rem', color: '#555' }}>
        Beta endpoint: <code>/beta/storage/fileStorage/containerTypeRegistrations</code>. Shape may change.
      </p>

      <Card>
        <CardHeader header={<Subtitle1>Lookup Registration by ID</Subtitle1>} />
        <div style={{ padding: '0 1rem 1rem', display: 'flex', gap: '.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Field label="Registration ID" style={{ minWidth: 360 }}>
            <Input value={queryId} onChange={(_, d) => setQueryId(d.value)} placeholder="Enter registration GUID (id)" />
          </Field>
          <Button appearance="primary" onClick={fetchById}>Fetch</Button>
          <Button appearance="secondary" onClick={() => { setQueryId(''); setDetail(null); setDetailError(null); }}>Clear</Button>
          <div style={{ flexBasis: '100%' }} />
          {detailLoading && <Spinner label="Loading registration..." />}
          {!detailLoading && detailError && <p style={{ color: 'red' }}>Error: {detailError}</p>}
          {!detailLoading && !detailError && detail && (
            <div style={{ width: '100%' }}>
              <KeyValue value={detail} />
            </div>
          )}
        </div>
      </Card>

      <section>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>All Registrations</h2>
          <Button size="small" appearance="secondary" onClick={loadList}>Reload</Button>
        </div>
        {loading && <Spinner label="Loading registrations..." />}
        {!loading && error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {!loading && !error && items.length === 0 && <p>No registrations found.</p>}
        {!loading && !error && items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '.5rem' }}>
            {items.map(it => (
              <div key={it.id} style={{ border: '1px solid var(--colorNeutralStroke2,#ccc)', borderRadius: 4, padding: '.75rem 1rem' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{it.displayName || it.name || '(no name)'} <span style={{ fontWeight: 400, color: '#666' }}>— {it.id}</span></div>
                <KeyValue value={it} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminContainerTypeRegistrationPage;
