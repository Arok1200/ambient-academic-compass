import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import notionService from '../services/notionService';
import { NOTION_CONFIG } from '../config/apiConfig';

function NotionCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(`Authorization failed: ${errorParam}`);
        setStatus('Error');
        setTimeout(() => {
          navigate('/');
        }, 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setStatus('Error');
        setTimeout(() => {
          navigate('/');
        }, 3000);
        return;
      }

      try {
        setStatus('Exchanging authorization code...');
        await notionService.exchangeCodeForToken(
          code,
          NOTION_CONFIG.clientId,
          NOTION_CONFIG.clientSecret,
          NOTION_CONFIG.redirectUri
        );

        setStatus('Authorization successful! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (err) {
        console.error('Error in Notion callback:', err);
        setError(err.message || 'Failed to complete authorization');
        setStatus('Error');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2>Notion Authorization</h2>
        <p style={styles.status}>{status}</p>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },
  content: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  status: {
    margin: '20px 0',
    fontSize: '16px',
    color: '#333',
  },
  error: {
    margin: '20px 0',
    fontSize: '14px',
    color: '#d32f2f',
  },
};

export default NotionCallback;
