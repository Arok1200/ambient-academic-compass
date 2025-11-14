import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function NotionCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus(`Error: ${error}`);
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (code) {
      fetch('/api/notion/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setStatus('Successfully connected to Notion!');
            localStorage.setItem('notion_access_token', data.access_token);
          } else {
            setStatus('Failed to connect to Notion');
          }
          setTimeout(() => navigate('/'), 2000);
        })
        .catch(err => {
          setStatus('Error connecting to Notion');
          console.error(err);
          setTimeout(() => navigate('/'), 2000);
        });
    } else {
      setStatus('No authorization code received');
      setTimeout(() => navigate('/'), 2000);
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      padding: '2rem'
    }}>
      <h1>Notion Authorization</h1>
      <p>{status}</p>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Redirecting to home page...
      </p>
    </div>
  );
}

export default NotionCallback;
