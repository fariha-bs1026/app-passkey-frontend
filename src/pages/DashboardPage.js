import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Container,
  Grid,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Fingerprint as FingerprintIcon,
  Face as FaceIcon,
  Key as KeyIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../context/ThemeContext';
import { passkeyService } from '../services/passkeyService';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useThemeMode();
  const navigate = useNavigate();
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [biometricCapabilities, setBiometricCapabilities] = useState(null);
  const [message, setMessage] = useState({ text: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [passkeys, setPasskeys] = useState([]);
  const [loadingPasskeys, setLoadingPasskeys] = useState(true);

  const loadPasskeys = useCallback(async () => {
    try {
      const list = await passkeyService.listPasskeys();
      setPasskeys(list);
    } catch (err) {
      console.error('Failed to load passkeys:', err);
    } finally {
      setLoadingPasskeys(false);
    }
  }, []);

  useEffect(() => {
    passkeyService.isSupported().then(setPasskeySupported);
    passkeyService.getBiometricCapabilities().then(setBiometricCapabilities);
    loadPasskeys();
  }, [loadPasskeys]);

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
    if (!biometricCapabilities) return 'Biometric';
    switch (biometricCapabilities.biometricType) {
      case 'face':
        return 'Face ID';
      case 'fingerprint':
        return 'Fingerprint';
      default:
        return 'Biometric';
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRegisterPasskey = async (authenticatorType = null) => {
    setMessage({ text: '', type: 'info' });
    setLoading(true);

    try {
      await passkeyService.registerPasskey(authenticatorType);
      setMessage({ text: 'Passkey registered successfully!', type: 'success' });
      loadPasskeys();
    } catch (err) {
      setMessage({ text: err.message || 'Failed to register passkey', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePasskey = async (credentialId) => {
    if (!window.confirm('Are you sure you want to delete this passkey?')) {
      return;
    }

    try {
      await passkeyService.deletePasskey(credentialId);
      setMessage({ text: 'Passkey deleted successfully!', type: 'success' });
      loadPasskeys();
    } catch (err) {
      setMessage({ text: err.message || 'Failed to delete passkey', type: 'error' });
    }
  };

  const getPasskeyType = (passkey) => {
    const transports = passkey.transports || '';
    if (transports.includes('usb') || transports.includes('nfc') || transports.includes('ble')) {
      return 'security_key';
    } else if (transports.includes('internal') || transports.includes('hybrid')) {
      return 'platform';
    }
    return 'unknown';
  };

  const getPasskeyIcon = (passkey) => {
    const type = getPasskeyType(passkey);
    switch (type) {
      case 'security_key':
        return <KeyIcon />;
      case 'platform':
        return getBiometricIcon();
      default:
        return <FingerprintIcon />;
    }
  };

  const getPasskeyTypeLabel = (passkey) => {
    const type = getPasskeyType(passkey);
    switch (type) {
      case 'security_key':
        return 'Security Key';
      case 'platform':
        return 'Device Passkey';
      default:
        return 'Passkey';
    }
  };

  const getPasskeyColor = (passkey) => {
    const type = getPasskeyType(passkey);
    switch (type) {
      case 'security_key':
        return 'warning';
      case 'platform':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Passkey Auth
          </Typography>
          <Tooltip title="Settings">
            <IconButton onClick={() => navigate('/settings')} color="inherit">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'}>
            <IconButton onClick={toggleTheme} color="inherit">
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Button
            color="error"
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ ml: 1 }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* User Info Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: 'primary.main',
                      fontSize: '1.5rem',
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h5" fontWeight="bold">
                      Welcome, {user?.username}!
                    </Typography>
                    <Chip
                      icon={user?.emailVerified ? <VerifiedIcon /> : <EmailIcon />}
                      label={user?.emailVerified ? 'Verified' : 'Unverified'}
                      color={user?.emailVerified ? 'success' : 'warning'}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body2">{user?.email}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Username
                        </Typography>
                        <Typography variant="body2">{user?.username}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Passkey Management Card */}
          {passkeySupported && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FingerprintIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="bold">
                      Passkey Management
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Register passkeys for secure, passwordless authentication.
                  </Typography>

                  {message.text && (
                    <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ text: '', type: 'info' })}>
                      {message.text}
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    {biometricCapabilities?.platformAuthenticator && (
                      <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <FingerprintIcon />}
                        onClick={() => handleRegisterPasskey('platform')}
                        disabled={loading}
                        sx={{
                          background: 'linear-gradient(45deg, #6c5ce7 30%, #a29bfe 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #5541d7 30%, #8c7ae6 90%)',
                          },
                        }}
                      >
                        Add Passkey
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={loading ? <CircularProgress size={20} /> : <KeyIcon />}
                      onClick={() => handleRegisterPasskey('cross-platform')}
                      disabled={loading}
                    >
                      Add Security Key
                    </Button>
                  </Box>

                  {/* Biometric Status */}
                  {biometricCapabilities && (
                    <Alert
                      severity={biometricCapabilities.platformAuthenticator ? "success" : "info"}
                      icon={biometricCapabilities.platformAuthenticator ? <CheckCircleIcon /> : getBiometricIcon()}
                      sx={{ mb: 2 }}
                    >
                      {biometricCapabilities.platformAuthenticator ? (
                        <>
                          <strong>{getBiometricLabel()}</strong> is available on this device.
                          {passkeys.length === 0 && " Register a biometric passkey for quick, secure login."}
                        </>
                      ) : (
                        "Biometric authentication is not available on this device. You can still use a security key."
                      )}
                    </Alert>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Your Passkeys
                  </Typography>

                  {loadingPasskeys ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress />
                    </Box>
                  ) : passkeys.length === 0 ? (
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 4,
                        bgcolor: 'action.hover',
                        borderRadius: 2,
                      }}
                    >
                      <FingerprintIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">
                        No passkeys registered yet.
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Add a passkey above to enable passwordless login.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {passkeys.map((passkey) => (
                        <Card
                          key={passkey.credentialId}
                          variant="outlined"
                          sx={{
                            p: 2,
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {/* Icon */}
                            <Avatar
                              sx={{
                                bgcolor: `${getPasskeyColor(passkey)}.main`,
                                width: 48,
                                height: 48,
                                flexShrink: 0,
                              }}
                            >
                              {getPasskeyIcon(passkey)}
                            </Avatar>

                            {/* Info */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {passkey.label || 'Unnamed Passkey'}
                                </Typography>
                                <Chip
                                  label={getPasskeyTypeLabel(passkey)}
                                  size="small"
                                  color={getPasskeyColor(passkey)}
                                />
                              </Box>
                              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Created: {formatDate(passkey.createdAt) || 'Unknown'}
                                </Typography>
                                {passkey.lastUsedAt && (
                                  <Typography variant="caption" color="text.secondary">
                                    Last used: {formatDate(passkey.lastUsedAt)}
                                  </Typography>
                                )}
                              </Box>
                            </Box>

                            {/* Delete Button */}
                            <Tooltip title="Delete Passkey">
                              <IconButton
                                color="error"
                                onClick={() => handleDeletePasskey(passkey.credentialId)}
                                sx={{ flexShrink: 0 }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Card>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>

    </Box>
  );
};
