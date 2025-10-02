import React, { useState } from 'react';
import '../../styles/debug-panel.css';
import { Button } from '@fluentui/react-components';
import { Copy24Regular } from '@fluentui/react-icons';

/**
 * Renders detailed information about a selected API request
 */
const RequestDetail = ({ call }) => {
  const [activeTab, setActiveTab] = useState('request');
  
  // Format JSON for display
  const formatJson = (data) => {
    try {
      if (typeof data === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsed = JSON.parse(data);
          return JSON.stringify(parsed, null, 2);
        } catch {
          return data;
        }
      }
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return '[Unable to format data]';
    }
  };
    // Copy content to clipboard
  const copyToClipboard = (text, event) => {
    // Get the button that was clicked
    const copyBtn = event.currentTarget;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        // Show brief feedback that it was copied
        if (copyBtn) {
          const originalContent = copyBtn.innerHTML;
          copyBtn.innerHTML = '<i class="fas fa-check"></i>';
          setTimeout(() => {
            copyBtn.innerHTML = originalContent;
          }, 1000);
        }
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };
  
  // Build a single aggregated text block representing the full exchange
  const buildAggregateText = (c) => {
    if (!c) return '';
    const lines = [];
    // Request line
    lines.push(`${c.method || 'GET'} ${c.url || ''}`);
    // Request headers
    if (c.requestHeaders) {
      lines.push('\n// Request Headers');
      try {
        // Clone and redact sensitive headers
        const redacted = JSON.parse(JSON.stringify(c.requestHeaders));
        const authKey = Object.keys(redacted).find(k => k.toLowerCase() === 'authorization');
        if (authKey && typeof redacted[authKey] === 'string') {
          const full = redacted[authKey];
          const truncated = full.slice(0, 20) + (full.length > 20 ? '…' : '');
            // Add note about truncation
          redacted[authKey] = truncated + '  (truncated)';
        }
        lines.push(JSON.stringify(redacted, null, 2));
      } catch {
        lines.push(String(c.requestHeaders));
      }
    }
    // Request body
    if (c.requestBody) {
      lines.push('\n// Request Body');
      if (typeof c.requestBody === 'string') {
        lines.push(c.requestBody);
      } else {
        try { lines.push(JSON.stringify(c.requestBody, null, 2)); } catch { lines.push(String(c.requestBody)); }
      }
    }
    // Response status
    lines.push('\n// Response Status');
    lines.push(`${c.status || (c.isError ? 'Error' : 'Pending')}`);
    // Response headers
    if (c.responseHeaders) {
      lines.push('\n// Response Headers');
      try {
        lines.push(JSON.stringify(c.responseHeaders, null, 2));
      } catch {
        lines.push(String(c.responseHeaders));
      }
    }
    // Response body
    if (c.responseBody) {
      lines.push('\n// Response Body');
      if (typeof c.responseBody === 'string') {
        lines.push(c.responseBody);
      } else {
        try { lines.push(JSON.stringify(c.responseBody, null, 2)); } catch { lines.push(String(c.responseBody)); }
      }
    }
    // Error (if any)
    if (c.isError && c.error) {
      lines.push('\n// Error');
      lines.push(String(c.error));
    }
    return lines.join('\n');
  };

  if (!call) {
    return (
      <div className="api-debug-detail-placeholder">
        <i className="fas fa-arrow-left"></i>
        <p>Select a request to view details</p>
      </div>
    );
  }
  
  return (
    <div className="api-debug-detail">
      <div className="api-debug-detail-header">
        <div className="api-debug-detail-url">
          <span className={`api-debug-method ${call.method.toLowerCase()}`}>
            {call.method}
          </span>
          <span className="api-debug-url">
            {call.url}
          </span>
        </div>
        <div className="api-debug-detail-status">
          {call.isError ? (
            <span className="api-debug-status error">
              {call.status || 'Error'}
            </span>
          ) : (
            <span className={`api-debug-status ${call.status >= 400 ? 'error' : 'success'}`}>
              {call.status || 'Pending'}
            </span>
          )}
        </div>
      </div>
      
      <div className="api-debug-tabs">
        <Button 
          appearance={activeTab === 'request' ? 'primary' : 'secondary'}
          className={`api-debug-tab ${activeTab === 'request' ? 'active' : ''}`}
          onClick={() => setActiveTab('request')}
        >
          Request
        </Button>
        <Button 
          appearance={activeTab === 'response' ? 'primary' : 'secondary'}
          className={`api-debug-tab ${activeTab === 'response' ? 'active' : ''}`}
          onClick={() => setActiveTab('response')}
        >
          Response
        </Button>
        <Button 
          appearance={activeTab === 'timing' ? 'primary' : 'secondary'}
          className={`api-debug-tab ${activeTab === 'timing' ? 'active' : ''}`}
          onClick={() => setActiveTab('timing')}
        >
          Timing
        </Button>
        <Button
          appearance="secondary"
            /* This is an action button, not a tab we switch to */
          className="api-debug-tab"
          onClick={(e) => copyToClipboard(buildAggregateText(call), e)}
          aria-label="Copy entire request and response"
          icon={<Copy24Regular />}
        >
          Copy All
        </Button>
      </div>
      
      <div className="api-debug-tab-content">
        {activeTab === 'request' && (
          <div className="api-debug-request-content">
            <div className="api-debug-section">
              <div className="api-debug-section-header">
                <h4>Headers</h4>
                <Button 
                  appearance="subtle"
                  className="api-debug-copy-button"
                  onClick={(e) => copyToClipboard(formatJson(call.requestHeaders), e)}
                  aria-label="Copy headers to clipboard"
                  icon={<Copy24Regular />}
                />
              </div>
              <pre className="api-debug-code">
                {formatJson(call.requestHeaders)}
              </pre>
            </div>
            
            {call.requestBody && (
              <div className="api-debug-section api-debug-body">
                <div className="api-debug-section-header">
                  <h4>Body</h4>
                  <Button 
                    appearance="subtle"
                    className="api-debug-copy-button"
                    onClick={(e) => copyToClipboard(
                      typeof call.requestBody === 'string' 
                        ? call.requestBody 
                        : formatJson(call.requestBody),
                      e
                    )}
                    aria-label="Copy body to clipboard"
                    icon={<Copy24Regular />}
                  />
                </div>
                <pre className="api-debug-code">
                  {typeof call.requestBody === 'string' 
                    ? call.requestBody 
                    : formatJson(call.requestBody)}
                </pre>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'response' && (
          <div className="api-debug-response-content">
            {call.isError && call.error && (
              <div className="api-debug-section error-section">
                <div className="api-debug-section-header">
                  <h4>Error</h4>
                </div>
                <div className="api-debug-error">
                  {call.error}
                </div>
              </div>
            )}
            
            {call.responseHeaders && (
              <div className="api-debug-section">
                <div className="api-debug-section-header">
                  <h4>Headers</h4>
                  <Button 
                    appearance="subtle"
                    className="api-debug-copy-button"
                    onClick={(e) => copyToClipboard(formatJson(call.responseHeaders), e)}
                    aria-label="Copy headers to clipboard"
                    icon={<Copy24Regular />}
                  />
                </div>
                <pre className="api-debug-code">
                  {formatJson(call.responseHeaders)}
                </pre>
              </div>
            )}
            
            {call.responseBody && (
              <div className="api-debug-section api-debug-body">
                <div className="api-debug-section-header">
                  <h4>Body</h4>
                  <Button 
                    appearance="subtle"
                    className="api-debug-copy-button"
                    onClick={(e) => copyToClipboard(
                      typeof call.responseBody === 'string' 
                        ? call.responseBody 
                        : formatJson(call.responseBody),
                      e
                    )}
                    aria-label="Copy body to clipboard"
                    icon={<Copy24Regular />}
                  />
                </div>
                <pre className="api-debug-code">
                  {typeof call.responseBody === 'string' 
                    ? call.responseBody 
                    : formatJson(call.responseBody)}
                </pre>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'timing' && (
          <div className="api-debug-timing-content">
            <div className="api-debug-timing-item">
              <div className="api-debug-timing-label">Started:</div>
              <div className="api-debug-timing-value">
                {new Date(call.timestamp).toLocaleString()}
              </div>
            </div>
            
            {call.duration && (
              <div className="api-debug-timing-item">
                <div className="api-debug-timing-label">Duration:</div>
                <div className="api-debug-timing-value">
                  {Math.round(call.duration)}ms
                </div>
              </div>
            )}
            
            <div className="api-debug-timing-chart">
              <div 
                className={`api-debug-timing-bar ${call.isError ? 'error' : 'success'}`}
                style={{ width: `${Math.min(100, call.duration / 50 * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetail;
