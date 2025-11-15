import React, { useState, useEffect, useContext } from 'react';
import { speService } from '../speService';
import { getTokenSilent } from '../authService';
import { speConfig } from '../authConfig';
import './AgentPage.css';
import { Button } from '@fluentui/react-components';
import { DebugModeContext } from '../context/DebugModeContext';

const AgentPage = () => {
  const [containers, setContainers] = useState([]);
  const [selectedContainerId, setSelectedContainerId] = useState('');
  const [queryString, setQueryString] = useState('');
  const [maxResults, setMaxResults] = useState(10);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const { setIsPanelVisible } = useContext(DebugModeContext);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  useEffect(() => {
    loadContainers();
  }, []);

  const loadContainers = async () => {
    try {
      const containerData = await speService.getContainers();
      setContainers(containerData);
    } catch (error) {
      console.error('Error loading containers:', error);
      setError('Failed to load containers: ' + error.message);
    }
  };

  const executeQuery = async (e) => {
    e.preventDefault();
    
    if (!queryString) {
      setError('Please enter a query string');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const token = await getTokenSilent();
      if (!token) {
        throw new Error('No access token available');
      }

      // Build request using the new SharePointEmbedded retrieval syntax
      const requestBody = {
        queryString,
        dataSource: 'SharePointEmbedded',
        dataSourceConfiguration: {
          SharePointEmbedded: {
            ContainerTypeId: speConfig.containerTypeId
          }
        },
        resourceMetadata: ["FileExtension"],
        maximumNumberOfResults: maxResults
      };

      // If a container is selected, fetch its webUrl and add a filter expression
      if (selectedContainerId) {
        const containerUrl = `https://graph.microsoft.com/v1.0/storage/fileStorage/containers/${selectedContainerId}/drive`;
        const containerResponse = await fetch(containerUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!containerResponse.ok) {
          throw new Error('Failed to fetch container details');
        }

        const containerDetails = await containerResponse.json();
        const webUrl = containerDetails.webUrl;
        
        if (webUrl) {
          requestBody.filterExpression = `(path:"${webUrl}")`;
        }
      }

      // Execute the Copilot retrieval query
      const queryUrl = 'https://graph.microsoft.com/beta/copilot/retrieval';
      const queryResponse = await fetch(queryUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!queryResponse.ok) {
        const errorData = await queryResponse.json();
        throw new Error(errorData.error?.message || 'Failed to execute query');
      }

      const queryResults = await queryResponse.json();
      setResults(queryResults);
      setShowResults(true);
      
    } catch (error) {
      console.error('Error executing query:', error);
      setError('Error executing query: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const backToForm = () => {
    setShowResults(false);
    setResults(null);
    setError(null);
  };

  if (showResults) {
    return (
      <>
        <div className="agent-page">
          <div className="container">
            <h1>Agent Results</h1>
            {results ? (
              <div className="results-container">
                <pre className="results-json">{JSON.stringify(results, null, 2)}</pre>
              </div>
            ) : (
              <p>No results found.</p>
            )}
            <Button 
              type="button" 
              appearance="secondary" 
              onClick={backToForm}
            >
              Back to Query Form
            </Button>
          </div>
        </div>

        {/* Mobile FAB + Drawer (API Explorer) */}
        <>
          <Button
            appearance="primary"
            className={"mobile-fab" + (mobileToolsOpen ? ' open' : '')}
            onClick={() => setMobileToolsOpen(s => !s)}
            title="Open tools"
            aria-label="Open tools"
          >
            ⋯
          </Button>

          {mobileToolsOpen && (
            <div 
              className="mobile-tools-backdrop open"
              onClick={() => setMobileToolsOpen(false)}
              role="presentation"
              aria-hidden="true"
            />
          )}

          <div className={"mobile-tools-drawer" + (mobileToolsOpen ? ' open' : '')} role="dialog" aria-label="Mobile tools drawer">
            <div className="mobile-tools-header">
              <strong>Tools</strong>
              <button className="mobile-tools-close" onClick={() => setMobileToolsOpen(false)} aria-label="Close">✕</button>
            </div>
            <div className="mobile-tools-body">
              <button className="mobile-tool-btn" onClick={() => {
                console.log('[AgentPage] API Explorer button clicked');
                setMobileToolsOpen(false);
                setTimeout(() => {
                  try { setIsPanelVisible && setIsPanelVisible(true); } catch(e) { console.error('[AgentPage] Error showing API panel', e); }
                }, 250);
              }}>API Explorer</button>
            </div>
          </div>
        </>
      </>
    );
  }

  return (
    <>
      <div className="agent-page">
      <div className="container">
        <h1>Copilot Retrieval Query</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={executeQuery} className="agent-form">
          <div className="form-group">
            <label htmlFor="containerId">Select a Container (Optional)</label>
            <select
              id="containerId"
              name="containerId"
              value={selectedContainerId}
              onChange={(e) => setSelectedContainerId(e.target.value)}
              className="form-control"
            >
              <option value="">-- All Containers --</option>
              {containers.map((container) => (
                <option key={container.id} value={container.id}>
                  {container.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="queryString">Query String</label>
            <input
              id="queryString"
              type="text"
              name="queryString"
              value={queryString}
              onChange={(e) => setQueryString(e.target.value)}
              placeholder="Enter your query"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxResults">Maximum Results</label>
            <input
              id="maxResults"
              type="number"
              name="maxResults"
              min="1"
              max="50"
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value))}
              required
              className="form-control"
            />
          </div>

          <Button 
            type="submit" 
            appearance="primary" 
            disabled={loading}
          >
            {loading ? 'Executing Query...' : 'Execute Query'}
          </Button>
        </form>
      </div>
    </div>

      {/* Mobile FAB + Drawer (API Explorer) */}
      <>
        <Button
          appearance="primary"
          className={"mobile-fab" + (mobileToolsOpen ? ' open' : '')}
          onClick={() => setMobileToolsOpen(s => !s)}
          title="Open tools"
          aria-label="Open tools"
        >
          ⋯
        </Button>

        {mobileToolsOpen && (
          <div 
            className="mobile-tools-backdrop open"
            onClick={() => setMobileToolsOpen(false)}
            role="presentation"
            aria-hidden="true"
          />
        )}

        <div className={"mobile-tools-drawer" + (mobileToolsOpen ? ' open' : '')} role="dialog" aria-label="Mobile tools drawer">
          <div className="mobile-tools-header">
            <strong>Tools</strong>
            <button className="mobile-tools-close" onClick={() => setMobileToolsOpen(false)} aria-label="Close">✕</button>
          </div>
          <div className="mobile-tools-body">
            <button className="mobile-tool-btn" onClick={() => {
              console.log('[AgentPage] API Explorer button clicked');
              setMobileToolsOpen(false);
              setTimeout(() => {
                try { setIsPanelVisible && setIsPanelVisible(true); } catch(e) { console.error('[AgentPage] Error showing API panel', e); }
              }, 250);
            }}>API Explorer</button>
          </div>
        </div>
      </>
    </>
  );
};

export default AgentPage;
