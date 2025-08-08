import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { speService } from '../services';
import { useAuth } from '../AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/search-modal.css';
import '../styles/search-page.css';
import '../styles/auth.css';
import './PageOne.css';

// Function to format search result summaries with custom tags
const formatSummary = (summary) => {
  if (!summary) return '';
  
  // Handle <c0> highlight tags (for search terms)
  let formattedSummary = summary.replace(/<c0>(.*?)<\/c0>/g, '<span class="highlight-term">$1</span>');
  
  // Handle <ddd/> truncation marks
  formattedSummary = formattedSummary.replace(/<ddd\/>/g, '<span class="truncation-mark">...</span>');
  
  return formattedSummary;
};

// Function to build SharePoint edit URL from search hit
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
    
    // Step 1: Get hostname from siteId
    const siteIdParts = resource.parentReference.siteId.split(',');
    const hostname = siteIdParts[0];
    
    // Step 2: Get site path from webUrl
    const webUrl = resource.webUrl;
    const sitePath = '/' + webUrl.split('/').slice(3, 5).join('/');
    
    // Step 3: Get sourcedoc from listItemUniqueId and format it
    const rawId = resource.parentReference.sharepointIds.listItemUniqueId;
    const upperId = rawId.toUpperCase();
    const sourcedoc = encodeURIComponent(`{${upperId}}`);
    
    // Step 4: Get file name
    const fileName = resource.name;
    
    // Step 5: Assemble final URL
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

const PageOne = () => {
  const [searchQuery, setSearchQuery] = useState('');
  // Set default to 'term' mode
  const [searchMode] = useState('term');
  const [fields] = useState('');
  const { accessToken, login } = useAuth();
  const { getDashboardContent, currentThemeId, currentTheme } = useTheme();
  // Set default to only driveItem (Files)
  const [entities] = useState({
    drive: false,
    driveItem: true
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Get theme content for intro
  const dashboardContent = getDashboardContent();
  const [results, setResults] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const getEntityTypes = () => {
    return ['driveItem']; // Always return driveItem as we've removed the options
  };
  
  const handleSearch = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setSearchError(null);
    setResults(null);
    
    try {
      const searchResults = await speService.advancedSearch({
        entityTypes: ['driveItem'],
        query: searchQuery,
        mode: 'term',
        fields: []
      });
      
      setResults(searchResults);
    } catch (err) {
      console.error('Search error:', err);
      setSearchError(err.message || 'An error occurred while performing the search');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    login();
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

    if (searchError) {
      return (
        <div className="search-error">
          {searchError}
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

    return (
      <div className="search-results-container">
        {Array.isArray(results.value?.[0]?.hitsContainers) &&
          results.value[0].hitsContainers.map((container, containerIndex) => (
            <div key={containerIndex} className="hits-container">
              {Array.isArray(container.hits) && container.hits.map((hit, hitIndex) => {
                // Get the resource so we can access all properties
                const resource = hit.resource;
                if (!resource) return null;
                
                // Format the display of the search result based on entity type
                const title = resource.name || resource.displayName || 'Untitled';
                const summary = hit.summary ? formatSummary(hit.summary) : '';
                const date = resource.lastModifiedDateTime ? new Date(resource.lastModifiedDateTime).toLocaleDateString() : '';
                const previewUrl = resource.webUrl || '';
                
                // For driveItems (files)
                const isFolder = resource.folder || (resource.contentClass === 'folder');
                const itemType = isFolder ? 'Folder' : (resource.file?.mimeType || '');
                const fileExtension = resource.name ? resource.name.split('.').pop().toLowerCase() : '';
                
                // Get containerId and itemId for navigation
                const containerId = resource.parentReference?.driveId || '';
                const itemId = resource.id || '';
                
                // Build edit URL using the new function
                const editUrl = buildEditUrlFromHit(hit);
                
                return (
                  <div key={hitIndex} className="search-result-item">                  <div className="search-result-header">
                      
                      {/* Title with link */}
                      <h3 className="search-result-title">
                      {/* First try to get SharePoint edit URL (only for editable Office docs, not PDF) */}
                      {(() => {
                        const sharePointEditUrl = buildEditUrlFromHit(hit);
                        // Determine extension & doc types
                        const extension = resource.name ? resource.name.split('.').pop().toLowerCase() : '';
                        const isEditableOfficeDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension); // removed pdf
                        const isPdf = extension === 'pdf';

                        // If it's an editable Office document and we have an edit URL, use it
                        if (sharePointEditUrl && isEditableOfficeDoc) {
                          return (
                            <a 
                              href={sharePointEditUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {title}
                            </a>
                          );
                        }
                        // If it's a PDF, route to internal preview page (works like List Items page preview)
                        if (isPdf && containerId && itemId) {
                          return (
                            <Link to={`/preview/${containerId}/${itemId}`}>
                              {title}
                            </Link>
                          );
                        }
                        // Fallback to internal preview for other files when possible
                        if (containerId && itemId) {
                          return (
                            <Link to={`/preview/${containerId}/${itemId}`}>
                              {title}
                            </Link>
                          );
                        }
                        return <span>{title}</span>;
                      })()}
                    </h3>
                  </div>
                    {summary && (
                    <div 
                      className="search-result-summary" 
                      dangerouslySetInnerHTML={{ __html: summary }}
                    />
                  )}
                  
                  {/* File metadata */}
                  <div className="search-result-meta">
                    {date && (
                      <span className="search-result-date">
                        <i className="fas fa-calendar-alt"></i> {date}
                      </span>
                    )}
                    {itemType && (
                      <span className="search-result-type" style={{ marginLeft: '10px' }}>
                        <i className="fas fa-file-alt"></i> {itemType}
                      </span>
                    )}
                  </div>
                  
                  {/* Debug info - hidden by default */}
                  <div className="result-debug" style={{ display: 'none', fontSize: '12px', color: '#777', marginTop: '8px' }}>
                    {resource.webUrl && (
                      <div>
                        <strong>Original URL:</strong> {resource.webUrl}
                      </div>
                    )}
                    {resource.parentReference?.siteId && (
                      <div>
                        <strong>Site ID:</strong> {resource.parentReference.siteId}
                      </div>
                    )}
                  </div>{/* Edit link for editable Office documents only (exclude PDFs) */}
                  {resource.file && (() => {
                    const ext = resource.name ? resource.name.split('.').pop().toLowerCase() : '';
                    const isEditableOfficeDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);
                    if (!isEditableOfficeDoc) return null; // no edit button for pdf or other non-editable types
                    const editUrlForBtn = buildEditUrlFromHit(hit);
                    if (!editUrlForBtn) return null;
                    return (
                      <div className="search-result-edit">
                        <a 
                          href={editUrlForBtn} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="edit-link"
                          style={{ 
                            display: 'inline-block', 
                            marginTop: '8px', 
                            padding: '8px 12px', 
                            backgroundColor: '#0078d4', 
                            color: 'white', 
                            borderRadius: '4px', 
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          <i className="fas fa-edit"></i>&nbsp;Edit Document
                        </a>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Content to show when user is logged in (search functionality)
  const renderSearchContent = () => {
    return (
      <>        <div>
          <input
            type="text"
            className="search-input"
            placeholder="Search for files and content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
              }
            }}
            aria-label="Search query"
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              marginBottom: '10px', 
              boxSizing: 'border-box',
              fontSize: '16px',
              border: '2px solid #333',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              backgroundColor: '#ffffff',
              color: '#000000'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleSearch}
              type="button" 
              style={{ 
                backgroundColor: '#0078d4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <i className="fas fa-search"></i>&nbsp;Search
            </button>
          </div>
        </div>
        
        {renderResults()}
      </>
    );
  };

  // Content to show when user is not logged in (login form)
  const renderLoginContent = () => {
    return (
      <div className="login-card">
        <h1>{currentTheme.name}</h1>
        <p className="login-subtitle">Sign in to get started.</p>
        
        <button 
          className="login-button" 
          onClick={handleLoginClick}
          style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: '#0078d4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: '500',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          Sign in with Microsoft
        </button>
        
        <div className="login-footer" style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <p>This application uses Microsoft Authentication Library (MSAL) for secure sign-in.</p>
          <p>Your credentials are never stored by this application.</p>
        </div>
      </div>
    );
  };

  const getProgressChartTitle = () => {
    switch (currentThemeId) {
      case 'fabrikam-legal':
        return 'Case Progress Overview';
      case 'contoso-audit':
        return 'Audit Progress Tracking';
      case 'northwind-insurance':
        return 'Claims Processing Status';
      default:
        return 'Activity Overview';
    }
  };

  const getProgressChartDescription = () => {
    switch (currentThemeId) {
      case 'fabrikam-legal':
        return 'Current status of your active legal matters and upcoming deadlines.';
      case 'contoso-audit':
        return 'Progress on current audit engagements and compliance reviews.';
      case 'northwind-insurance':
        return 'Real-time status of insurance claims and processing metrics.';
      default:
        return 'Overview of your recent activity and progress.';
    }
  };

  const renderProgressChart = () => {
    switch (currentThemeId) {
      case 'fabrikam-legal':
        return renderLegalProgressChart();
      case 'contoso-audit':
        return renderAuditProgressChart();
      case 'northwind-insurance':
        return renderInsuranceProgressChart();
      default:
        return renderDefaultProgressChart();
    }
  };

  const renderLegalProgressChart = () => {
    const caseData = [
      { label: 'Discovery', count: 8, color: '#28a745' },
      { label: 'Pre-Trial', count: 4, color: '#ffc107' },
      { label: 'Settlement', count: 3, color: '#17a2b8' },
      { label: 'Trial Prep', count: 2, color: '#dc3545' }
    ];

    return (
      <div className="progress-bars">
        {caseData.map((item, index) => (
          <div key={index} className="progress-item">
            <div className="progress-label">
              <span>{item.label}</span>
              <span className="progress-count">{item.count}</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${(item.count / 17) * 100}%`, 
                  backgroundColor: item.color 
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAuditProgressChart = () => {
    const auditData = [
      { label: 'Planning', count: 2, color: '#6f42c1' },
      { label: 'Fieldwork', count: 5, color: '#28a745' },
      { label: 'Review', count: 3, color: '#ffc107' },
      { label: 'Reporting', count: 1, color: '#dc3545' }
    ];

    return (
      <div className="progress-bars">
        {auditData.map((item, index) => (
          <div key={index} className="progress-item">
            <div className="progress-label">
              <span>{item.label}</span>
              <span className="progress-count">{item.count}</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${(item.count / 11) * 100}%`, 
                  backgroundColor: item.color 
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderInsuranceProgressChart = () => {
    const claimData = [
      { label: 'New Claims', count: 12, color: '#007bff' },
      { label: 'Under Review', count: 8, color: '#ffc107' },
      { label: 'Approved', count: 15, color: '#28a745' },
      { label: 'Pending Payment', count: 4, color: '#fd7e14' }
    ];

    return (
      <div className="progress-bars">
        {claimData.map((item, index) => (
          <div key={index} className="progress-item">
            <div className="progress-label">
              <span>{item.label}</span>
              <span className="progress-count">{item.count}</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${(item.count / 39) * 100}%`, 
                  backgroundColor: item.color 
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDefaultProgressChart = () => {
    return (
      <div className="progress-bars">
        <div className="progress-item">
          <div className="progress-label">
            <span>Activity</span>
            <span className="progress-count">75%</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: '75%', backgroundColor: '#007bff' }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container home-container">
      {/* Only show intro content for SPE Demo theme */}
      {currentThemeId === 'spe-demo' && (
        <div className="home-content">
          <h1 className="home-headline">{dashboardContent.introTitle}</h1>
          <p className="home-text">
            {dashboardContent.introText}
          </p>
        </div>
      )}
      
      {/* Dashboard section - only show when logged in */}
      {accessToken && (
        <div className="dashboard-section">
          <h2 className="dashboard-section-title">{dashboardContent.welcomeMessage}</h2>
          
          {/* Search section moved under welcome message */}
          <div className="search-section">
            <h3 className="search-section-title">Search Your Content</h3>
            <div className="search-page-content">
              {renderSearchContent()}
            </div>
          </div>
          
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h3>Recent Activity</h3>
              <p className="card-description">{dashboardContent.cardDescription}</p>
              <ul className="activity-list">
                {dashboardContent.recentActivities.map((activity, index) => (
                  <li key={index}>{activity}</li>
                ))}
              </ul>
            </div>

            <div className="dashboard-card">
              <h3>Quick Actions</h3>
              <p className="card-description">Common tasks you can perform from your dashboard.</p>
              <div className="action-buttons">
                {dashboardContent.quickActions.map((action, index) => (
                  <button key={index} className="action-button">{action}</button>
                ))}
              </div>
            </div>

            <div className="dashboard-card">
              <h3>{getProgressChartTitle()}</h3>
              <p className="card-description">{getProgressChartDescription()}</p>
              <div className="progress-chart">
                {renderProgressChart()}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Show login form when not logged in */}
      {!accessToken && (
        <div className="home-search-container">
          <div className="search-page-content">
            {renderLoginContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PageOne;
