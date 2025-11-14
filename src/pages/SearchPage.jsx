import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { speService } from '../services';
import { useAuth } from '../AuthContext';
import '../styles/search-modal.css';
import '../styles/search-page.css';

// Function to format search result summaries with custom tags
const formatSummary = (summary) => {
  if (!summary) return '';
  
  // Handle <c0> highlight tags (for search terms)
  let formattedSummary = summary.replace(/<c0>(.*?)<\/c0>/g, '<span class="highlight-term">$1</span>');
  
  // Handle <ddd/> truncation marks
  formattedSummary = formattedSummary.replace(/<ddd\/>/g, '<span class="truncation-mark">...</span>');
  
  return formattedSummary;
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
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

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
    e.preventDefault();
    
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
        <div className="search-loading">
          <div className="spinner"></div>
          <div>Searching...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="search-error">
          {error}
        </div>
      );
    }

    if (!results) return null;

    if (!results.value?.[0]?.hitsContainers?.length) {
      return (
        <div className="no-results">
          No results found for "{searchQuery}"
        </div>
      );
    }
    
    // Extract hits from result
    const hits = results.value[0].hitsContainers
      .flatMap(container => container.hits || []);
        // New implementation that builds edit URL from site ID and other properties
    const buildEditUrlFromHit = (hit) => {
      try {
        const resource = hit.resource;
        
        // Skip if required properties are missing
        if (!resource.parentReference?.siteId || 
            !resource.webUrl || 
            !resource.name || 
            !resource.parentReference?.sharepointIds?.listItemUniqueId) {
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

    return (
      <div className="search-results">
        <h3>Search Results ({hits.length})</h3>
        {hits.map((hit, index) => {
          const resource = hit.resource;
          // More precise check for drive vs. driveItem
          const odataType = resource['@odata.type'] || '';
          const isDrive = odataType.endsWith('drive') && !odataType.endsWith('driveItem');
          const driveId = resource.parentReference?.driveId || resource.id;
          const itemId = resource.id;
          
          // Default link for internal app navigation
          const appLinkTo = isDrive 
            ? `/list/${driveId}` 
            : `/preview/${driveId}/${itemId}`;
            // Get SharePoint edit URL if possible
          const sharePointEditUrl = buildEditUrlFromHit(hit);
          
          // Determine file extension & editable Office doc types (exclude pdf)
          const filename = resource.name || '';
          const extension = filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';
          const isEditableOfficeDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension);
          const isPdf = extension === 'pdf';
          
          return (
            <div key={index} className="result-item">
              {isDrive ? (
                // Drive link - open in same tab
                <Link to={appLinkTo} className="result-title">
                  {resource.name || 'Unnamed resource'}
                </Link>
              ) : (sharePointEditUrl && isEditableOfficeDoc) ? (
                // Editable Office documents open SharePoint edit URL in new tab
                <a 
                  href={sharePointEditUrl}
                  className="result-title"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {resource.name || 'Unnamed resource'}
                </a>
              ) : (
                // PDFs and other files -> internal preview route
                <Link to={appLinkTo} className="result-title">
                  {resource.name || 'Unnamed resource'}
                </Link>
              )}{/* ...existing code... */}
              {hit.summary ? (
                <div className="result-summary" dangerouslySetInnerHTML={{ 
                  __html: formatSummary(hit.summary)
                }} />
              ) : resource.summary ? (
                <div className="result-summary" dangerouslySetInnerHTML={{ 
                  __html: formatSummary(resource.summary)
                }} />
              ) : null}
              
              {/* Hide debugging info unless needed */}
              <div className="result-debug" style={{ display: 'none' }}>
                {resource.webUrl && (
                  <div className="result-url small">
                    <strong>Original URL:</strong> {resource.webUrl}
                  </div>
                )}
                
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="page-container search-page">
      <h1>Search SharePoint Embedded</h1>
      
      <div className="search-page-content">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-bar">
            <input 
              className="search-input"
              placeholder="Search query..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            <button className="search-submit-button" type="submit">Search</button>
          </div>
          
          <button 
            type="button" 
            className="advanced-options-toggle"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            aria-expanded={showAdvancedOptions}
          >
            <span className="toggle-icon">{showAdvancedOptions ? '−' : '+'}</span>
            Advanced Options
          </button>

          <div className={`advanced-options ${showAdvancedOptions ? 'open' : 'closed'}`}>
            <div className="form-row">
              <label className="section-label">Search Entity Types</label>
              <div className="entity-checkboxes">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={entities.drive}
                    onChange={() => handleEntityChange('drive')}
                  />
                  Drive
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={entities.driveItem}
                    onChange={() => handleEntityChange('driveItem')}
                  />
                  Drive Item (files/folders)
                </label>
              </div>
            </div>
            
            <div className="form-row">
              <label className="section-label">Search Mode</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input 
                    type="radio" 
                    value="term"
                    checked={searchMode === 'term'}
                    onChange={() => setSearchMode('term')}
                  />
                  Term (auto-append container filter)
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    value="exact"
                    checked={searchMode === 'exact'}
                    onChange={() => setSearchMode('exact')}
                  />
                  Exact (use query as provided)
                </label>
              </div>
            </div>
            
            <div className="form-row">
              <label htmlFor="fieldsInput">Optional Fields (comma-separated)</label>
              <input 
                id="fieldsInput"
                className="fields-input"
                placeholder="E.g., name,size,lastModifiedDateTime" 
                value={fields}
                onChange={(e) => setFields(e.target.value)}
              />
              <div className="help-text">
                Specify fields to include in results (leave empty for defaults)
              </div>
            </div>

            <div className="search-guide">
              <div className="guide-title">Search Tips</div>
              <ul className="guide-list">
                <li>Use metadata queries with suffixes like <code>filename:OWSTEXT:"example"</code></li>
                <li>Wildcard searches: <code>exam*</code> or <code>*ample</code></li>
                <li>Prefix searches: <code>prefix:"doc"</code></li>
                <li>Term search automatically filters to your container type</li>
                <li>Exact search uses your query exactly as written</li>
              </ul>
            </div>
          </div>
        </form>
        
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
