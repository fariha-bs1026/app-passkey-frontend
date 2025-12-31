import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  TextField,
  InputAdornment,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Fingerprint as FingerprintIcon,
  Key as KeyIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Google as GoogleIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../context/ThemeContext';
import { authApi } from '../api/authApi';
import { passkeyService } from '../services/passkeyService';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { toggleTheme, isDark } = useThemeMode();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const passwordSectionRef = useRef(null);

  const [accountStatus, setAccountStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSetPasswordPrompt, setShowSetPasswordPrompt] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'info' });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [passkeys, setPasskeys] = useState([]);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const loadAccountStatus = useCallback(async () => {
    try {
      const response = await authApi.getAccountStatus();
      setAccountStatus(response.data);
    } catch (err) {
      console.error('Failed to load account status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPasskeys = useCallback(async () => {
    try {
      const list = await passkeyService.listPasskeys();
      setPasskeys(list);
    } catch (err) {
      console.error('Failed to load passkeys:', err);
    }
  }, []);

  useEffect(() => {
    loadAccountStatus();
    loadPasskeys();
  }, [loadAccountStatus, loadPasskeys]);

  useEffect(() => {
    if (searchParams.get('setPassword') === 'true') {
      setShowSetPasswordPrompt(true);
      setTimeout(() => {
        passwordSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [searchParams]);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: 'info' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({ text: 'Password must be at least 8 characters', type: 'error' });
      return;
    }

    setPasswordLoading(true);
    try {
      await authApi.setPassword(passwordForm.newPassword, passwordForm.confirmPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      loadAccountStatus();

      if (showSetPasswordPrompt) {
        setMessage({ text: 'Password set successfully! You can now login with your password.', type: 'success' });
        setShowSetPasswordPrompt(false);
        navigate('/settings', { replace: true });
      } else {
        setMessage({ text: 'Password set successfully!', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to set password', type: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: 'info' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({ text: 'New password must be at least 8 characters', type: 'error' });
      return;
    }

    setPasswordLoading(true);
    try {
      await authApi.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      setMessage({ text: 'Password changed successfully!', type: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to change password', type: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAddPasskey = async () => {
    setMessage({ text: '', type: 'info' });
    setPasskeyLoading(true);
    try {
      await passkeyService.registerPasskey('platform');
      setMessage({ text: 'Passkey added successfully!', type: 'success' });
      loadPasskeys();
      loadAccountStatus();
    } catch (err) {
      setMessage({ text: err.message || 'Failed to add passkey', type: 'error' });
    } finally {
      setPasskeyLoading(false);
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
      loadAccountStatus();
    } catch (err) {
      setMessage({ text: err.message || 'Failed to delete passkey', type: 'error' });
    }
  };

  const handleGoogleLink = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Account Settings
          </Typography>
          <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'}>
            <IconButton onClick={toggleTheme} color="inherit">
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ text: '', type: 'info' })}>
            {message.text}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Authentication Methods Overview */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Authentication Methods
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Manage how you sign in to your account
                </Typography>

                <Grid container spacing={2}>
                  {/* Password Status */}
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: accountStatus?.hasPassword ? 'success.main' : 'grey.400', mx: 'auto', mb: 1 }}>
                          <LockIcon />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight="bold">Password</Typography>
                        <Chip
                          size="small"
                          icon={accountStatus?.hasPassword ? <CheckCircleIcon /> : <CancelIcon />}
                          label={accountStatus?.hasPassword ? 'Enabled' : 'Not Set'}
                          color={accountStatus?.hasPassword ? 'success' : 'default'}
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Google Status */}
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: accountStatus?.hasGoogle ? 'error.main' : 'grey.400', mx: 'auto', mb: 1 }}>
                          <GoogleIcon />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight="bold">Google</Typography>
                        <Chip
                          size="small"
                          icon={accountStatus?.hasGoogle ? <CheckCircleIcon /> : <CancelIcon />}
                          label={accountStatus?.hasGoogle ? 'Connected' : 'Not Connected'}
                          color={accountStatus?.hasGoogle ? 'success' : 'default'}
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Passkey Status */}
                  <Grid item xs={12} sm={4}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: accountStatus?.hasPasskey ? 'primary.main' : 'grey.400', mx: 'auto', mb: 1 }}>
                          <FingerprintIcon />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight="bold">Passkeys</Typography>
                        <Chip
                          size="small"
                          icon={accountStatus?.hasPasskey ? <CheckCircleIcon /> : <CancelIcon />}
                          label={accountStatus?.passkeyCount > 0 ? `${accountStatus.passkeyCount} Active` : 'None'}
                          color={accountStatus?.hasPasskey ? 'success' : 'default'}
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Password Management */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    {accountStatus?.hasPassword ? 'Change Password' : 'Set Password'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {accountStatus?.hasPassword
                    ? 'Update your password to keep your account secure'
                    : 'Set a password to enable email/password login'}
                </Typography>

                <Box component="form" onSubmit={accountStatus?.hasPassword ? handleChangePassword : handleSetPassword}>
                  <Stack spacing={2} sx={{ maxWidth: 400 }}>
                    {accountStatus?.hasPassword && (
                      <TextField
                        label="Current Password"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                        fullWidth
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}>
                                {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                    <TextField
                      label="New Password"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      fullWidth
                      helperText="Minimum 8 characters"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}>
                              {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      label="Confirm Password"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      fullWidth
                      error={passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword}
                      helperText={
                        passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                          ? 'Passwords do not match'
                          : ''
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}>
                              {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={passwordLoading}
                      startIcon={passwordLoading ? <CircularProgress size={20} /> : <LockIcon />}
                    >
                      {passwordLoading ? 'Saving...' : accountStatus?.hasPassword ? 'Change Password' : 'Set Password'}
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Google Account */}
          {!accountStatus?.hasGoogle && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <GoogleIcon sx={{ mr: 1, color: '#db4437' }} />
                    <Typography variant="h6" fontWeight="bold">
                      Link Google Account
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Connect your Google account for quick sign-in
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleGoogleLink}
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
                    Connect Google Account
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Passkey Management */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FingerprintIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Passkey Management
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Manage your passkeys for passwordless authentication
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleAddPasskey}
                    disabled={passkeyLoading}
                    startIcon={passkeyLoading ? <CircularProgress size={20} /> : <FingerprintIcon />}
                    sx={{
                      background: 'linear-gradient(45deg, #6c5ce7 30%, #a29bfe 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5541d7 30%, #8c7ae6 90%)',
                      },
                    }}
                  >
                    Add Passkey
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => passkeyService.registerPasskey('cross-platform').then(() => { loadPasskeys(); loadAccountStatus(); })}
                    startIcon={<KeyIcon />}
                  >
                    Add Security Key
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                {passkeys.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <FingerprintIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">No passkeys registered yet</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {passkeys.map((passkey) => (
                      <Card key={passkey.credentialId} variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <FingerprintIcon />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {passkey.label || 'Passkey'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Created: {new Date(passkey.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Tooltip title="Delete Passkey">
                            <IconButton color="error" onClick={() => handleDeletePasskey(passkey.credentialId)}>
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
        </Grid>
      </Container>
    </Box>
  );
};
