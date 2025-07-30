import React from 'react';
import '../styles/modals.css';

const DriveInfoModal = ({ driveInfo, onClose }) => {
  if (!driveInfo) return null;

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatUser = (user) => {
    if (!user) return 'N/A';
    return user.displayName || user.email || user.id || 'Unknown';
  };

  return (
    <div className="modal-overlay standard open" onClick={onClose}>
      <div className="modal-container medium fade-in open" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Container Drive Properties</h2>
          <button className="modal-close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-content">
          <div className="drive-info-container">
            <table className="drive-info-table">
              <tbody>
                <tr>
                  <th>Name</th>
                  <td>{driveInfo.name || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Description</th>
                  <td>{driveInfo.description || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Drive Type</th>
                  <td>{driveInfo.driveType || 'N/A'}</td>
                </tr>
                <tr>
                  <th>ID</th>
                  <td className="drive-id">{driveInfo.id || 'N/A'}</td>
                </tr>
                <tr>
                  <th>Web URL</th>
                  <td>
                    {driveInfo.webUrl ? (
                      <a href={driveInfo.webUrl} target="_blank" rel="noopener noreferrer">
                        {driveInfo.webUrl}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Created Date</th>
                  <td>{formatDate(driveInfo.createdDateTime)}</td>
                </tr>
                <tr>
                  <th>Last Modified Date</th>
                  <td>{formatDate(driveInfo.lastModifiedDateTime)}</td>
                </tr>
                <tr>
                  <th>Created By</th>
                  <td>{formatUser(driveInfo.createdBy?.user)}</td>
                </tr>
                <tr>
                  <th>Last Modified By</th>
                  <td>
                    {driveInfo.lastModifiedBy?.user ? (
                      <div>
                        <div>{formatUser(driveInfo.lastModifiedBy.user)}</div>
                        {driveInfo.lastModifiedBy.user.email && (
                          <div className="user-email">Email: {driveInfo.lastModifiedBy.user.email}</div>
                        )}
                        {driveInfo.lastModifiedBy.user.id && (
                          <div className="user-id">ID: {driveInfo.lastModifiedBy.user.id}</div>
                        )}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
                {driveInfo.quota && (
                  <>
                    <tr>
                      <th>Quota State</th>
                      <td>{driveInfo.quota.state || 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Quota Deleted</th>
                      <td>{driveInfo.quota.deleted ? formatBytes(driveInfo.quota.deleted) : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Quota Remaining</th>
                      <td>{driveInfo.quota.remaining ? formatBytes(driveInfo.quota.remaining) : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Quota Total</th>
                      <td>{driveInfo.quota.total ? formatBytes(driveInfo.quota.total) : 'N/A'}</td>
                    </tr>
                    <tr>
                      <th>Quota Used</th>
                      <td>{driveInfo.quota.used ? formatBytes(driveInfo.quota.used) : 'N/A'}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="button secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriveInfoModal;
