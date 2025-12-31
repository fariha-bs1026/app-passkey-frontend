import axiosClient from './axiosClient';

export const passkeyApi = {
  getRegistrationOptions(authenticatorType = null) {
    const params = authenticatorType ? { authenticatorType } : {};
    return axiosClient.post('/api/passkey/register/options', null, { params });
  },

  completeRegistration(credential) {
    return axiosClient.post('/api/passkey/register', credential);
  },

  getAuthenticationOptions(email = null) {
    return axiosClient.post('/api/passkey/authenticate/options', email ? { email } : {});
  },

  verifyAuthentication(credential) {
    return axiosClient.post('/api/passkey/authenticate', credential);
  },

  listPasskeys() {
    return axiosClient.get('/api/passkey/list');
  },

  deletePasskey(credentialId) {
    return axiosClient.delete(`/api/passkey/${encodeURIComponent(credentialId)}`);
  },
};
