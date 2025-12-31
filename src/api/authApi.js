import axiosClient from './axiosClient';

export const authApi = {
  register(email, username, password) {
    return axiosClient.post('/api/auth/register', {
      email,
      username,
      password,
    });
  },

  login(emailOrUsername, password) {
    return axiosClient.post('/api/auth/login', {
      emailOrUsername,
      password,
    });
  },

  refresh(refreshToken) {
    return axiosClient.post('/api/auth/refresh', { refreshToken });
  },

  logout(refreshToken) {
    return axiosClient.post('/api/auth/logout', { refreshToken });
  },

  getCurrentUser() {
    return axiosClient.get('/api/auth/me');
  },

  getAccountStatus() {
    return axiosClient.get('/api/auth/account-status');
  },

  setPassword(password, confirmPassword) {
    return axiosClient.post('/api/auth/set-password', {
      password,
      confirmPassword,
    });
  },

  changePassword(currentPassword, newPassword, confirmPassword) {
    return axiosClient.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
  },
};
