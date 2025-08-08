import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { speService } from '../services';
import { useAuth } from '../AuthContext';
import '../styles/search-modal.css';
import '../styles/search-page.css';
// New modern styles
import '../styles/page-one-modern.css';

// Fluent UI
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardPreview,
  CardFooter,
  Divider,
  Text,
  Tag,
  Spinner,
  Link as FluentLink
} from '@fluentui/react-components';
import {
  Search24Regular,
  Open24Regular,
  ArrowDownload24Regular,
  Edit24Regular,
  CalendarClock24Regular,
  Document24Regular
} from '@fluentui/react-icons';

// Function to format search result summaries with custom tags
const formatSummary = (summary) => {
  if (!summary) return '';
  
  // Handle <c0> highlight tags (for search terms)
  let formattedSummary = summary.replace(/<c0>(.*?)<\/c0>/g, '<span class="highlight-term">$1<\/span>');
  
  // Handle <ddd/> truncation marks
  formattedSummary = formattedSummary.replace(/<ddd\/>/g, '<span class="truncation-mark">...<\/span>');
  
  return formattedSummary;
};

// Build SharePoint edit URL from search hit
const buildEditUrlFromHit = (hit) => {
  try {
    const resource = hit.resource;
    
    // Skip if required properties are missing
    if (!resource?.parentReference?.siteId || !resource?.webUrl || !resource?.name || !resource?.parentReference?.sharepointIds?.listItemUniqueId) {
      return null;
    }
    
    // Get hostname from siteId
    const siteIdParts = resource.parentReference.siteId.split(',');
    const hostname = siteIdParts[0];
    
    // Get site path from webUrl
    const webUrl = resource.webUrl;
    const sitePath = '/' + webUrl.split('/').slice(3, 5).join('/');
    
    // Get sourcedoc from listItemUniqueId and format it
    const rawId = resource.parentReference.sharepointIds.listItemUniqueId;
    const upperId = rawId.toUpperCase();
    const sourcedoc = encodeURIComponent(`{${upperId}}`);
    
    // Get file name
    const fileName = resource.name;
    
    // Assemble final URL
    const finalUrl = `https://${hostname}${sitePath}/_layouts/15/Doc.aspx?sourcedoc=${sourcedoc}&file=${encodeURIComponent(fileName)}&action=edit&mobileredirect=true`;
    
    // Sanity check: ensure URL is valid
    try {
      new URL(finalUrl);
      return finalUrl;
    } catch (e) {
      console.error('Invalid URL generated:', finalUrl, e);
      return null;
    }
  } catch (error) {
    console.error('Error generating SharePoint edit URL:', error);
    return null;
  }
};

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('term');
  const [fields, setFields] = useState('');
  const { accessToken } = useAuth();
  const [entities, setEntities] = useState({
    drive: false,
    driveItem: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleEntityChange = (entity) => {
    setEntities(prev => ({
      ...prev,
      [entity]: !prev[entity]
    }));
  };

  const getEntityTypes = () => {
    const types = [];
    if (entities.drive) types.push('drive');
    if (entities.driveItem) types.push('driveItem');
    return types.length ? types : ['driveItem']; // Default to driveItem if none selected
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const entityTypes = getEntityTypes();
      const fieldsArray = fields.trim() ? fields.split(',').map(f => f.trim()) : [];
      
      const searchResults = await speService.advancedSearch({
        entityTypes,
        query: searchQuery,
        mode: searchMode,
        fields: fieldsArray
      });
      
      setResults(searchResults);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred while performing the search');
    } finally {
      setIsLoading(false);
    }
  };

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="po-loading">
          <Spinner label="Searching…" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="po-error">{error}</div>
      );
    }

    if (!results) return null;

    if (!results.value?.[0]?.hitsContainers?.length) {
      return (
        <div className="po-empty">
          <div className="po-empty-illustration" />
          <h3>No results</h3>
          <p>Try different keywords or check your spelling.</p>
        </div>
      );
    }

    const hits = results.value[0].hitsContainers.flatMap(container => container.hits || []);

    return (
      <div className="po-results-grid">
        {hits.map((hit, index) => {
          const resource = hit.resource;
          const title = resource?.name || resource?.displayName || 'Untitled';
          const summaryHtml = hit.summary ? formatSummary(hit.summary) : '';
          const date = resource?.lastModifiedDateTime ? new Date(resource.lastModifiedDateTime).toLocaleString() : '';
          const isFolder = resource?.folder || (resource?.contentClass === 'folder');
          const mime = resource?.file?.mimeType || (isFolder ? 'folder' : 'file');
          const extension = resource?.name ? resource.name.split('.').pop().toLowerCase() : '';
          const containerId = resource?.parentReference?.driveId || '';
          const itemId = resource?.id || '';
          const editUrl = buildEditUrlFromHit(hit);
          const isOfficeDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension);
          const internalPreviewLink = containerId && itemId ? `/preview/${containerId}/${itemId}` : '';

          return (
            <Card key={index} className="po-result-card" appearance="filled">
              <CardHeader
                header={<Text weight="semibold">{title}</Text>}
                description={
                  <div className="po-meta-row">
                    <span className="po-meta"><CalendarClock24Regular /> {date || '—'}</span>
                    <span className="po-meta"><Document24Regular /> {mime}</span>
                    {extension && <Tag size="small" appearance="filled" className="po-chip">.{extension}</Tag>}
                  </div>
                }
              />

              {summaryHtml && (
                <CardPreview>
                  <div className="po-summary" dangerouslySetInnerHTML={{ __html: summaryHtml }} />
                </CardPreview>
              )}

              <Divider />

              <CardFooter>
                <div className="po-actions">
                  {isOfficeDoc && editUrl ? (
                    <FluentLink className="po-link-button" href={editUrl} target="_blank" rel="noopener noreferrer">
                      <Edit24Regular /> Edit in SharePoint
                    </FluentLink>
                  ) : (
                    internalPreviewLink && (
                      <FluentLink className="po-link-button" as={RouterLink} to={internalPreviewLink}>
                        <Open24Regular /> Open Preview
                      </FluentLink>
                    )
                  )}
                  {resource?.webUrl && (
                    <FluentLink className="po-link-button secondary" href={resource.webUrl} target="_blank" rel="noopener noreferrer">
                      <ArrowDownload24Regular /> Open Source
                    </FluentLink>
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="page-container page-one-modern">
      <div className="po-section">
        <div className="po-section-head">
          <h1 className="po-section-title">Search SharePoint Embedded</h1>
          <p className="po-section-desc">Find content across your containers with rich previews and quick actions.</p>
        </div>

        <div className="po-search-area">
          <form onSubmit={handleSearch}>
            <div className="po-toolbar">
              <Input
                size="large"
                placeholder="Enter search query…"
                value={searchQuery}
                onChange={(_, data) => setSearchQuery(data.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(e); } }}
              />
              <Button appearance="primary" size="large" icon={<Search24Regular />} type="submit">Search</Button>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              <div className="radio-group" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <label>
                  <input type="radio" value="term" checked={searchMode === 'term'} onChange={() => setSearchMode('term')} />
                  <span style={{ marginLeft: 6 }}>Term (auto-append container filter)</span>
                </label>
                <label>
                  <input type="radio" value="exact" checked={searchMode === 'exact'} onChange={() => setSearchMode('exact')} />
                  <span style={{ marginLeft: 6 }}>Exact (use query as provided)</span>
                </label>
              </div>

              <div className="entity-checkboxes" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <label>
                  <input type="checkbox" checked={entities.drive} onChange={() => handleEntityChange('drive')} />
                  <span style={{ marginLeft: 6 }}>Drive</span>
                </label>
                <label>
                  <input type="checkbox" checked={entities.driveItem} onChange={() => handleEntityChange('driveItem')} />
                  <span style={{ marginLeft: 6 }}>Drive Item (files/folders)</span>
                </label>
              </div>

              <div className="form-row">
                <label htmlFor="fieldsInput">Optional Fields (comma-separated)</label>
                <Input id="fieldsInput" placeholder="E.g., name,size,lastModifiedDateTime" value={fields} onChange={(_, data) => setFields(data.value)} />
                <Text size={200} style={{ color: '#5f6a7a' }}>Specify fields to include in results (leave empty for defaults)</Text>
              </div>
            </div>
          </form>
        </div>

        {renderResults()}
      </div>
    </div>
  );
};

export default SearchPage;

// For testing the URL building function
const exampleHit = {
  resource: {
    name: "Banking_in_1980s_London.pptx",
    webUrl: "https://greenwoodeccentrics.sharepoint.com/contentstorage/CSP_d964985a-950d-4d58-95ed-472b0b8501b8/Document Library/Banking_in_1980s_London.pptx",
    parentReference: {
      siteId: "greenwoodeccentrics.sharepoint.com,d964985a-950d-4d58-95ed-472b0b8501b8,b5f657d1-4618-40b0-a76b-a1e75bf4bc3d",
      sharepointIds: {
        listItemUniqueId: "8b9d86f7-e6dc-4feb-9ff5-036c0e222159"
      }
    }
  }
};

// Uncomment to test in console
// console.log(buildEditUrlFromHit(exampleHit));
