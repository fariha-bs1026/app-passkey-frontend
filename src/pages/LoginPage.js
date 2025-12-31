import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  Link,
  Stack,
  CircularProgress,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Fingerprint as FingerprintIcon,
  Face as FaceIcon,
  Login as LoginIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Key as KeyIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/authApi';
import { passkeyService } from '../services/passkeyService';

export const LoginPage = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricCapabilities, setBiometricCapabilities] = useState(null);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    passkeyService.getBiometricCapabilities().then((caps) => {
      setBiometricCapabilities(caps);
      if (!caps.platformAuthenticator) {
        setShowPasswordLogin(true);
      }
    });
  }, [isAuthenticated, navigate]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(emailOrUsername, password);
      const { accessToken, refreshToken, user } = response.data;
      await login(accessToken, refreshToken, user);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      if (errorMessage.includes('Password login not available')) {
        setShowGooglePrompt(true);
        setError('');
      } else {
        setShowGooglePrompt(false);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await passkeyService.authenticateWithPasskey();
      const { accessToken, refreshToken, user } = result;
      await login(accessToken, refreshToken, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Biometric authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = (setPasswordAfter = false) => {
    if (setPasswordAfter) {
      localStorage.setItem('redirectToSetPassword', 'true');
    }
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const getBiometricIcon = () => {
    if (!biometricCapabilities) return <FingerprintIcon />;

    switch (biometricCapabilities.biometricType) {
      case 'face':
        return <FaceIcon />;
      case 'fingerprint':
        return <FingerprintIcon />;
      default:
        return <FingerprintIcon />;
    }
  };

  const getBiometricLabel = () => {
    if (!biometricCapabilities) return 'Sign in with Biometrics';

    switch (biometricCapabilities.biometricType) {
      case 'face':
        return 'Sign in with Face ID';
      case 'fingerprint':
        return 'Sign in with Fingerprint';
      default:
        return 'Sign in with Biometrics';
    }
  };

  const hasBiometrics = biometricCapabilities?.platformAuthenticator;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom fontWeight="bold">
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Sign in to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {showGooglePrompt && (
            <Alert
              severity="info"
              sx={{ mb: 2 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setShowGooglePrompt(false)}
                >
                  Dismiss
                </Button>
              }
            >
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Google Account Detected
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                This account was created with Google. Sign in with Google to set a password for future logins.
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<GoogleIcon />}
                onClick={() => handleGoogleLogin(true)}
                sx={{
                  bgcolor: '#db4437',
                  '&:hover': { bgcolor: '#c33d2e' },
                }}
              >
                Sign in with Google & Set Password
              </Button>
            </Alert>
          )}

          {hasBiometrics && (
            <>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleBiometricLogin}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : getBiometricIcon()}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(45deg, #6c5ce7 30%, #a29bfe 90%)',
                  boxShadow: '0 4px 20px rgba(108, 92, 231, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5541d7 30%, #8c7ae6 90%)',
                    boxShadow: '0 6px 25px rgba(108, 92, 231, 0.5)',
                  },
                }}
              >
                {loading ? 'Authenticating...' : getBiometricLabel()}
              </Button>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: 2,
                  mb: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Quick, secure, passwordless login
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
            </>
          )}

          <Box>
            <Button
              fullWidth
              onClick={() => setShowPasswordLogin(!showPasswordLogin)}
              endIcon={showPasswordLogin ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ mb: 1, justifyContent: 'space-between' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <KeyIcon fontSize="small" />
                Sign in with Password
              </Box>
            </Button>

            <Collapse in={showPasswordLogin}>
              <Box component="form" onSubmit={handlePasswordLogin}>
                <Stack spacing={2}>
                  <TextField
                    label="Email or Username"
                    type="text"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    fullWidth
                    required
                    autoComplete="username webauthn"
                  />

                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                    autoComplete="current-password"
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </Stack>
              </Box>
            </Collapse>
          </Box>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Stack spacing={2}>
            {biometricCapabilities?.webAuthnSupported && (
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={handleBiometricLogin}
                disabled={loading}
                startIcon={<KeyIcon />}
                color="secondary"
              >
                Sign in with Security Key
              </Button>
            )}

            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={handleGoogleLogin}
              disabled={loading}
              startIcon={<GoogleIcon />}
              sx={{
                borderColor: '#db4437',
                color: '#db4437',
                '&:hover': {
                  borderColor: '#c33d2e',
                  bgcolor: 'rgba(219, 68, 55, 0.04)',
                },
              }}
            >
              Sign in with Google
            </Button>
          </Stack>

          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register" underline="hover">
              Register
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
