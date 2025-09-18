import { useEffect, useState } from 'react';
import { speService } from '../speService';
import { speConfig } from '../authConfig';
import { Spinner, Button, Card, CardHeader } from '@fluentui/react-components';

// Recursive key/value renderer for arbitrary JSON objects
const KeyValue = ({ value }) => {
  if (value === null) return <span style={{ color: '#666' }}>null</span>;
  const t = typeof value;
  if (t === 'string') {
    // Light heuristic for ISO date display
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return <span title={value}>{d.toLocaleString()}</span>;
    }
    return <span>{value}</span>;
  }
  if (t === 'number' || t === 'boolean') return <span>{String(value)}</span>;
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

const AdminContainerTypesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDetail, setCurrentDetail] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const currentId = speConfig.containerTypeId;

  const loadList = async () => {
    setLoading(true); setError(null);
    try {
      const list = await speService.listContainerTypes();
      console.debug('Container types list response:', list);
      setItems(list);
    } catch (e) {
      setError(e.message || 'Failed to load container types');
    } finally { setLoading(false); }
  };

  const loadCurrent = async () => {
    if (!currentId) return;
    setDetailLoading(true); setDetailError(null); setCurrentDetail(null);
    try {
      const detail = await speService.getContainerType(currentId);
      console.debug('Configured container type detail:', detail);
      setCurrentDetail(detail);
    } catch (e) { setDetailError(e.message); }
    finally { setDetailLoading(false); }
  };

  useEffect(() => { loadList(); if (currentId) loadCurrent(); }, []);

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>Container Types (Full Fields)</h1>
        <Button size="small" onClick={loadList} appearance="secondary">Reload List</Button>
        {currentId && <Button size="small" onClick={loadCurrent} appearance="primary">Reload Configured Type</Button>}
      </div>
      <p style={{ marginTop: '-.5rem', fontSize: '.8rem', color: '#555' }}>
        Using beta endpoints: <code>/beta/storage/fileStorage/containerTypes</code>. Beta payload shape may change; displayed below verbatim (recursively) for debugging/inspection.
      </p>

      {currentId && (
        <Card>
          <CardHeader header={<strong>Configured Container Type</strong>} description={currentId} />
          <div style={{ padding: '.75rem 1rem 1rem' }}>
            {detailLoading && <Spinner label="Loading configured container type..." />}
            {!detailLoading && detailError && <p style={{ color: 'red' }}>Error: {detailError}</p>}
            {!detailLoading && !detailError && currentDetail && (
              <div>
                <KeyValue value={currentDetail} />
              </div>
            )}
            {!detailLoading && !detailError && !currentDetail && <p>No configured container type detail returned.</p>}
          </div>
        </Card>
      )}

      <section>
        <h2 style={{ marginTop: 0 }}>All Container Types (Raw)</h2>
        {loading && <Spinner label="Loading list..." />}
        {!loading && error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {!loading && !error && items.length === 0 && <p>No container types found.</p>}
        {!loading && !error && items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

// Table styles removed since we now show raw recursive objects
// const th = { ... } etc removed

export default AdminContainerTypesPage;
