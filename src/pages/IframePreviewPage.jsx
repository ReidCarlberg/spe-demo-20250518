import React, { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@fluentui/react-components';
import { ArrowLeft24Regular } from '@fluentui/react-icons';
import { speService } from '../services';

// A minimal, dedicated page that renders a provided preview URL in an iframe.
// Preferred usage: navigate to this route with location.state = { url, name }.
// Fallbacks: accepts `?url=` query param, or will fetch via :driveId/:itemId params.
const IframePreviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { driveId, itemId } = useParams();

  const { url: stateUrl, name: stateName } = (location.state || {});

  const searchParams = new URLSearchParams(location.search);
  const queryUrl = searchParams.get('url');
  const fileName = stateName || searchParams.get('name') || 'Document Preview';

  // Compute the preview URL with a preference order: state.url -> query url -> fetch by params
  const previewUrl = useMemo(() => {
    if (stateUrl) return stateUrl;
    if (queryUrl) return queryUrl;
    return null; // fall back to fetch section below
  }, [stateUrl, queryUrl]);

  // If we don't already have a URL, kick off a lightweight fetch-once by constructing a promise.
  // To keep the page simple and avoid extra state, we'll render a temporary message and then
  // replace history with the resolved URL so refresh keeps working.
  if (!previewUrl && driveId && itemId) {
    // Trigger fetch (only once) and then navigate to same page with state set
    speService.getFilePreviewUrl(driveId, itemId)
      .then((url) => {
        navigate(`/iframe-preview/${driveId}/${itemId}`, { replace: true, state: { url } });
      })
      .catch((err) => {
        console.error('Failed to get preview URL:', err);
        navigate(-1);
      });

    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100dvh' }}>
        <div style={{ textAlign: 'center' }}>
          <p>Preparing preview…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', width: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'saturate(180%) blur(12px)'
      }}>
        <Button appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fileName}
        </div>
      </div>

      {previewUrl ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          minHeight: 0,
          padding: '32px 0 0 0'
        }}>
          <div style={{
            marginBottom: 12,
            fontWeight: 500,
            color: '#444',
            letterSpacing: 0.2,
            fontSize: 16
          }}>
            Document Preview (iframe)
          </div>
          <div style={{
            width: '96%',
            height: '90%',
            maxWidth: 1200,
            minHeight: 400,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            border: '3px solid #4b6cb7',
            borderRadius: 16,
            overflow: 'hidden',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'stretch',
          }}>
            <iframe
              src={previewUrl}
              title="Document Preview"
              style={{
                flex: 1,
                border: 'none',
                width: '100%',
                height: '100%',
                background: '#fff',
                borderRadius: 0
              }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', placeItems: 'center', flex: 1 }}>
          <div style={{ textAlign: 'center', padding: 24 }}>
            <h3>Preview URL not provided</h3>
            <p>Try opening the file again from the file browser.</p>
            <Button appearance="primary" onClick={() => navigate(-1)} style={{ marginTop: 8 }}>
              Go Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IframePreviewPage;
