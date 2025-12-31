import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { passkeyApi } from '../api/passkeyApi';

export const passkeyService = {
  async isSupported() {
    if (!window.PublicKeyCredential) {
      return false;
    }
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  },

  async isPlatformAuthenticatorAvailable() {
    if (!window.PublicKeyCredential) {
      return false;
    }
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  },

  async isConditionalMediationAvailable() {
    if (!window.PublicKeyCredential) {
      return false;
    }
    try {
      if (typeof window.PublicKeyCredential.isConditionalMediationAvailable === 'function') {
        return await window.PublicKeyCredential.isConditionalMediationAvailable();
      }
      return false;
    } catch {
      return false;
    }
  },

  async getBiometricCapabilities() {
    const capabilities = {
      webAuthnSupported: !!window.PublicKeyCredential,
      platformAuthenticator: false,
      conditionalUI: false,
      biometricType: 'none',
    };

    if (!window.PublicKeyCredential) {
      return capabilities;
    }

    try {
      capabilities.platformAuthenticator =
        await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

      if (typeof window.PublicKeyCredential.isConditionalMediationAvailable === 'function') {
        capabilities.conditionalUI =
          await window.PublicKeyCredential.isConditionalMediationAvailable();
      }

      if (capabilities.platformAuthenticator) {
        const userAgent = navigator.userAgent.toLowerCase();
        const platform = navigator.platform?.toLowerCase() || '';

        if (/iphone|ipad|ipod/.test(userAgent)) {
          capabilities.biometricType = 'face';
        } else if (/mac/.test(platform)) {
          capabilities.biometricType = 'fingerprint';
        } else if (/android/.test(userAgent)) {
          capabilities.biometricType = 'fingerprint';
        } else if (/win/.test(platform)) {
          capabilities.biometricType = 'fingerprint';
        } else {
          capabilities.biometricType = 'fingerprint';
        }
      }
    } catch (e) {
      console.error('Error detecting biometric capabilities:', e);
    }

    return capabilities;
  },

  async registerPasskey(authenticatorType = null) {
    const optionsResponse = await passkeyApi.getRegistrationOptions(authenticatorType);
    const options = optionsResponse.data;

    const credential = await startRegistration({ optionsJSON: options });

    const response = await passkeyApi.completeRegistration(credential);
    return response.data;
  },

  async authenticateWithPasskey() {
    const optionsResponse = await passkeyApi.getAuthenticationOptions();
    const options = optionsResponse.data;

    const credential = await startAuthentication({ optionsJSON: options });

    const response = await passkeyApi.verifyAuthentication(credential);
    return response.data;
  },

  async listPasskeys() {
    const response = await passkeyApi.listPasskeys();
    return response.data;
  },

  async deletePasskey(credentialId) {
    const response = await passkeyApi.deletePasskey(credentialId);
    return response.data;
  },
};
