import React from 'react';
import '../../styles/debug-panel.css';

/**
 * Renders a list of API requests for the debug panel
 */
const RequestList = ({ calls, selectedCall, onSelectCall }) => {
  // Format URL to show only the path, with query params shortened
  const formatUrl = (urlString) => {
    try {
      const url = new URL(urlString);
      const pathParts = url.pathname.split('/');
      const lastPath = pathParts[pathParts.length - 1];
      return lastPath ? lastPath : url.pathname.slice(-15);
    } catch (e) {
      return urlString.slice(-15);
    }
  };
  
  // Format time to a readable format
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  // Determine status class based on HTTP status
  const getStatusClass = (call) => {
    if (call.isError) return 'error';
    
    const status = call.status || 0;
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'redirect';
    if (status >= 400) return 'error';
    
    return 'pending';
  };
  
  // Format duration to ms
  const formatDuration = (duration) => {
    return duration ? `${Math.round(duration)}ms` : '';
  };
  
  return (
    <div className="api-debug-request-list">
      {calls.length === 0 ? (
        <div className="api-debug-no-requests">
          No requests match the current filter
        </div>
      ) : (
        <ul>
          {calls.map((call) => (
            <li 
              key={call.id} 
              className={`api-debug-request-item ${
                selectedCall && selectedCall.id === call.id ? 'selected' : ''
              } ${getStatusClass(call)}`}
              onClick={() => onSelectCall(call)}
            >
              <div className="api-debug-request-method">
                {call.method}
              </div>
              <div className="api-debug-request-url">
                {formatUrl(call.url)}
              </div>
              <div className="api-debug-request-status">
                {call.status || (call.isError ? 'Error' : '-')}
              </div>
              <div className="api-debug-request-time">
                {formatTime(call.timestamp)}
              </div>
              <div className="api-debug-request-duration">
                {formatDuration(call.duration)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RequestList;
