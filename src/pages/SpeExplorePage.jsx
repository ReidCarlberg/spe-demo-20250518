import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../context/ThemeContext';
import { speService } from '../services';
import {
  Button,
  Toolbar, ToolbarButton,
  Card, CardHeader, CardFooter,
  Field, Input, Textarea, Checkbox,
  Text, Badge, Avatar, Tooltip,
  Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions,
  Skeleton, makeStyles, mergeClasses, tokens, Spinner, Subtitle1, Title1
} from '@fluentui/react-components';
import { Add24Regular, Delete24Regular, Folder24Regular, ShieldLock24Regular, Search24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import './SpeExplorePage.css';

const useStyles = makeStyles({
  page: { padding: '48px clamp(1rem,3vw,3rem)', minHeight: '100vh' },
  headerWrap: { marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' },
  title: { display: 'flex', alignItems: 'center', gap: '12px' },
  toolbar: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.25rem' },
  grid: { marginTop: '1rem', display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' },
  card: { transition: 'transform .25s, box-shadow .25s', position: 'relative', ':hover': { transform: 'translateY(-4px)', boxShadow: tokens.shadow64 } },
  meta: { display: 'grid', gap: '2px', fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3, marginTop: '8px' },
  id: { fontFamily: 'JetBrains Mono, Menlo, monospace', fontSize: tokens.fontSizeBase200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  footerBtns: { display: 'flex', justifyContent: 'space-between', width: '100%' },
  createForm: { maxWidth: 620, marginBottom: '2rem', animation: 'fadeIn .4s ease' },
  formActions: { display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', gap: '8px' },
  empty: { marginTop: '2rem', textAlign: 'center', padding: '4rem 1rem', border: `1px dashed ${tokens.colorNeutralStroke1}`, borderRadius: tokens.borderRadiusXLarge },
  searchInput: { maxWidth: 280 },
  skeletonCard: { height: 250 },
  chip: { marginLeft: 'auto' }
});

const SpeExplorePage = () => {
  const { isAuthenticated, loading, accessToken } = useAuth();
  const { getDocumentsContent } = useTheme();
  const navigate = useNavigate();
  const styles = useStyles();

  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newContainer, setNewContainer] = useState({ displayName: '', description: '', isOcrEnabled: false });
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent'); // 'recent' | 'name'
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Get theme-based content
  const documentsContent = getDocumentsContent();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, loading]);

  useEffect(() => {
    // Fetch containers when component mounts and user is authenticated
    if (isAuthenticated && accessToken) {
      fetchContainers();
    }
  }, [isAuthenticated, accessToken]);

  const fetchContainers = async () => {
    setIsLoading(true);
    try {
      const data = await speService.getContainers();
      setContainers(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching containers:', error);
      setError('Failed to load containers. ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateContainer = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const createdContainer = await speService.createContainer(newContainer);
      setContainers(prev => [...prev, createdContainer]);
      setNewContainer({ displayName: '', description: '', isOcrEnabled: false });
      setShowCreateForm(false);
      setError(null);
    } catch (error) {
      console.error('Error creating container:', error);
      setError('Failed to create container. ' + error.message);
    } finally { setIsLoading(false); }
  };

  const handleInputChange = (e, data) => {
    const { name, value, checked, type } = e.target || {}; // native event from textarea/input/checkbox
    const fieldName = name || data?.name;
    const fieldVal = type === 'checkbox' ? checked : value;
    setNewContainer(prev => ({ ...prev, [fieldName]: fieldVal }));
  };

  const handleViewDocuments = (containerId) => navigate(`/file-browser/${containerId}`);

  const requestDelete = (container) => setDeleteTarget(container);
  const cancelDelete = () => setDeleteTarget(null);
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsLoading(true);
    try {
      await speService.deleteContainer(deleteTarget.id);
      setContainers(prev => prev.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting container:', error);
      setError('Failed to delete container: ' + error.message);
    } finally { setIsLoading(false); }
  };

  // Calculate how many days ago the container was created
  const getDaysAgo = (dateString) => {
    const created = new Date(dateString); const now = new Date(); const diffDays = Math.floor((now - created) / 86400000);
    if (diffDays === 0) return 'Today'; if (diffDays === 1) return 'Yesterday'; if (diffDays < 7) return `${diffDays}d ago`; if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`; return `${Math.floor(diffDays / 30)}mo ago`;
  };
  // Function to get a status class based on creation date
  const getStatusColor = (dateString) => { const d = new Date(dateString); const diffDays = Math.floor((Date.now() - d) / 86400000); if (diffDays < 7) return 'success'; if (diffDays < 30) return 'brand'; return 'neutral'; };

  const filteredSorted = useMemo(() => {
    let list = containers;
    if (query) { const q = query.toLowerCase(); list = list.filter(c => c.displayName?.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)); }
    list = [...list].sort((a,b) => sort === 'name' ? a.displayName.localeCompare(b.displayName) : new Date(b.createdDateTime) - new Date(a.createdDateTime));
    return list;
  }, [containers, query, sort]);

  // If still loading or not authenticated, show loading or nothing
  if (loading || !isAuthenticated) {
    return <div className={styles.page}><Spinner label="Loading SharePoint Embedded explorer..." /></div>;
  }

  return (
    <div className={mergeClasses('spe-container', styles.page)}>
      <div className={styles.headerWrap}>
        <Title1 as="h1">{documentsContent.pageTitle}</Title1>
        <Subtitle1 as="p">{documentsContent.pageSubtitle}</Subtitle1>
      </div>

      {error && <div role="alert"><Text style={{ color: tokens.colorPaletteRedForeground2 }}>{error}</Text></div>}

      <Toolbar className={styles.toolbar} aria-label="container actions">
        <ToolbarButton icon={<Add24Regular />} appearance="primary" onClick={() => setShowCreateForm(p => !p)}>{showCreateForm ? 'Close Form' : 'New Container'}</ToolbarButton>
        <Input className={styles.searchInput} contentBefore={<Search24Regular />} placeholder="Search" value={query} onChange={(e, data) => setQuery(data.value)} appearance="filled-darker" />
        <ToolbarButton appearance={sort === 'recent' ? 'primary' : 'subtle'} onClick={() => setSort('recent')}>Recent</ToolbarButton>
        <ToolbarButton appearance={sort === 'name' ? 'primary' : 'subtle'} onClick={() => setSort('name')}>Name</ToolbarButton>
        <ToolbarButton icon={<Dismiss24Regular />} appearance="subtle" disabled={!query} onClick={() => setQuery('')}>Clear</ToolbarButton>
        <ToolbarButton appearance="subtle" onClick={fetchContainers}>Refresh</ToolbarButton>
      </Toolbar>

      {showCreateForm && (
        <Card className={styles.createForm} appearance="filled-alternative">
          <CardHeader header={<Text weight="semibold">Create New Container</Text>} />
          <form onSubmit={handleCreateContainer} style={{ display: 'grid', gap: '16px' }}>
            <Field label="Container Name" required>
              <Input name="displayName" value={newContainer.displayName} onChange={handleInputChange} />
            </Field>
            <Field label="Description">
              <Textarea name="description" value={newContainer.description} onChange={handleInputChange} />
            </Field>
            <Field>
              <Checkbox name="isOcrEnabled" checked={newContainer.isOcrEnabled} label="Enable OCR (text extraction for images/PDFs)" onChange={(e, data) => setNewContainer(prev => ({ ...prev, isOcrEnabled: data.checked }))} />
            </Field>
            <div className={styles.formActions}>
              <Button appearance="secondary" type="button" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              <Button appearance="primary" type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create'}</Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading && !containers.length ? (
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className={mergeClasses(styles.card, styles.skeletonCard)} appearance="filled-alternative">
              <Skeleton shape="circle" size={40} />
              <Skeleton width={140} />
              <Skeleton width={90} />
              <Skeleton width="100%" />
              <Skeleton width="70%" />
            </Card>
          ))}
        </div>
      ) : filteredSorted.length === 0 ? (
        <div className={styles.empty}>
          <Text weight="semibold">No containers match your filters.</Text>
          <div style={{ marginTop: 12 }}><Button appearance="primary" onClick={() => { setQuery(''); setSort('recent'); fetchContainers(); }}>Reset</Button></div>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredSorted.map(container => {
            const age = getDaysAgo(container.createdDateTime);
            const statusColor = getStatusColor(container.createdDateTime);
            return (
              <Card key={container.id} className={styles.card} appearance="filled-alternative">
                <CardHeader
                  image={<Avatar name={container.displayName} color="brand" />}
                  header={<Text weight="semibold">{container.displayName}</Text>}
                  description={<Badge color={statusColor} appearance="tint" className={styles.chip}>{age}</Badge>}
                />
                <div className={styles.meta}>
                  <Tooltip content={container.id} relationship="description">
                    <span className={styles.id}>ID: {container.id}</span>
                  </Tooltip>
                  <span>Created: {new Date(container.createdDateTime).toLocaleString()}</span>
                </div>
                <CardFooter className={styles.footerBtns}>
                  <Button icon={<Folder24Regular />} appearance="primary" onClick={() => handleViewDocuments(container.id)}>Open</Button>
                  <Button icon={<ShieldLock24Regular />} appearance="secondary" onClick={() => navigate(`/container-permissions/${container.id}`)}>Permissions</Button>
                  <Button icon={<Delete24Regular />} appearance="outline" onClick={() => requestDelete(container)} aria-label={`Delete ${container.displayName}`} />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(e, data) => { if (!data.open) cancelDelete(); }}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete {deleteTarget?.displayName}?</DialogTitle>
            <DialogContent>This action cannot be undone.</DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={cancelDelete}>Cancel</Button>
              <Button appearance="primary" disabled={isLoading} onClick={confirmDelete} icon={<Delete24Regular />}>Delete</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default SpeExplorePage;
