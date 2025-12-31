import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/authApi';
import { tokenService } from '../services/tokenService';

export const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');

      if (accessToken && refreshToken) {
        try {
          tokenService.setTokens(accessToken, refreshToken);

          const response = await authApi.getCurrentUser();
          await login(accessToken, refreshToken, response.data);


          const shouldSetPassword = localStorage.getItem('redirectToSetPassword');
          if (shouldSetPassword) {
            localStorage.removeItem('redirectToSetPassword');
            navigate('/set-password');
          } else {
            navigate('/dashboard');
          }
        } catch (err) {
          setError('Failed to complete authentication');
          tokenService.clearTokens();
        }
      } else {
        setError('Authentication failed - no tokens received');
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Authentication Failed</h2>
          <p style={styles.error}>{error}</p>
          <button onClick={() => navigate('/login')} style={styles.button}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Completing authentication...</h2>
        <p>Please wait while we log you in.</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  error: {
    color: '#c62828',
    marginBottom: '16px',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};
