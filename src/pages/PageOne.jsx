import React, { useState } from 'react';
// Remove unused Link import
// import { Link } from 'react-router-dom';
import { speService } from '../services';
import { useAuth } from '../AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/search-modal.css';
import '../styles/search-page.css';
import '../styles/auth.css';
import './PageOne.css';
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
import { Link as RouterLink } from 'react-router-dom';
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

// A modern result card for search hits
const ResultCard = ({ hit }) => {
  const resource = hit.resource;
  if (!resource) return null;

  const title = resource.name || resource.displayName || 'Untitled';
  const summary = hit.summary ? formatSummary(hit.summary) : '';
  const date = resource.lastModifiedDateTime ? new Date(resource.lastModifiedDateTime).toLocaleString() : '';
  const isFolder = resource.folder || (resource.contentClass === 'folder');
  const mime = resource.file?.mimeType || (isFolder ? 'folder' : 'file');
  const extension = resource.name ? resource.name.split('.').pop().toLowerCase() : '';
  const containerId = resource.parentReference?.driveId || '';
  const itemId = resource.id || '';
  const editUrl = buildEditUrlFromHit(hit);

  const isOfficeDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension);
  const internalPreviewLink = containerId && itemId ? `/preview/${containerId}/${itemId}` : '';

  return (
    <Card className="po-result-card" appearance="filled">
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

      {summary && (
        <CardPreview>
          <div
            className="po-summary"
            dangerouslySetInnerHTML={{ __html: summary }}
          />
        </CardPreview>
      )}

      <Divider />

      <CardFooter>
        <div className="po-actions">
          {isOfficeDoc && editUrl ? (
            // use Fluent Link styled anchor for consistency
            <FluentLink href={editUrl} target="_blank" rel="noopener noreferrer" className="po-link-button">
              <Edit24Regular /> Edit in SharePoint
            </FluentLink>
          ) : (
            internalPreviewLink && (
              <FluentLink className="po-link-button" as={RouterLink} to={internalPreviewLink}>
                <Open24Regular /> Open Preview
              </FluentLink>
            )
          )}
          {resource.webUrl && (
            <FluentLink
              className="po-link-button secondary"
              href={resource.webUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ArrowDownload24Regular /> Open Source
            </FluentLink>
          )}
        </div>
      </CardFooter>
    </Card>
  );
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
        <div className="po-loading">
          <Spinner label="Searching…" />
        </div>
      );
    }

    if (searchError) {
      return (
        <div className="po-error">{searchError}</div>
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

    return (
      <div className="po-results-grid">
        {Array.isArray(results.value?.[0]?.hitsContainers) &&
          results.value[0].hitsContainers.map((container, containerIndex) => (
            <React.Fragment key={containerIndex}>
              {Array.isArray(container.hits) && container.hits.map((hit, hitIndex) => (
                <ResultCard key={`${containerIndex}-${hitIndex}`} hit={hit} />
              ))}
            </React.Fragment>
          ))}
      </div>
    );
  };

  // Content to show when user is logged in (search functionality)
  const renderSearchContent = () => {
    return (
      <>
        <div className="po-toolbar">
          <Input
            size="large"
            placeholder="Search files and content…"
            value={searchQuery}
            onChange={(_, data) => setSearchQuery(data.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
              }
            }}
          />
          <Button appearance="primary" size="large" icon={<Search24Regular />} onClick={handleSearch}>
            Search
          </Button>
        </div>

        {renderResults()}
      </>
    );
  };

  // Content to show when user is not logged in (login form)
  const renderLoginContent = () => {
    return (
      <Card className="po-login-card" appearance="filled">
        <CardHeader
          header={<Text weight="semibold" size={600}>{currentTheme.name}</Text>}
          description={<Text>Sign in to get started.</Text>}
        />
        <Divider />
        <div className="po-login-body">
          <Button appearance="primary" size="large" onClick={handleLoginClick}>
            Sign in with Microsoft
          </Button>
          <Text size={300} className="po-login-footnote">
            This application uses Microsoft Authentication Library (MSAL) for secure sign-in. Your credentials are never stored by this application.
          </Text>
        </div>
      </Card>
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
    <div className="page-container page-one-modern">
      {/* Only show intro content for SPE Demo theme */}
      {currentThemeId === 'spe-demo' && (
        <div className="po-hero">
          <div className="po-hero-content">
            <h1 className="po-hero-title">{dashboardContent.introTitle}</h1>
            <p className="po-hero-sub">{dashboardContent.introText}</p>
          </div>
        </div>
      )}

      {/* Dashboard section - only show when logged in */}
      {accessToken && (
        <div className="po-section">
          <div className="po-section-head">
            <h2 className="po-section-title">{dashboardContent.welcomeMessage}</h2>
            <p className="po-section-desc">Search across your content with rich previews and quick actions.</p>
          </div>

          <div className="po-search-area">
            {renderSearchContent()}
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
                  <Button key={index} appearance="secondary" size="medium" className="action-button">
                    {action}
                  </Button>
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
        <div className="po-section">
          <div className="po-search-area">
            {renderLoginContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PageOne;
