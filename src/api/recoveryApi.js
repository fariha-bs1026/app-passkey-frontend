import axiosClient from './axiosClient';

export const recoveryApi = {
  generateRecoveryCodes() {
    return axiosClient.post('/api/recovery/generate');
  },

  getRecoveryStatus() {
    return axiosClient.get('/api/recovery/status');
  },

  verifyRecoveryCode(email, code) {
    return axiosClient.post('/api/recovery/verify', { email, code });
  },
};
