/**
 * Firebase App Check Shim
 * 
 * This module provides a no-op implementation of Firebase App Check
 * to prevent errors with _isFirebaseServerApp during client-side rendering.
 */

// Mock implementation helpers
const mock = () => {};
const mockReturn = (val) => () => val;
const mockPromise = () => Promise.resolve({});
const mockClass = class {};

// Create a mock App Check token
const mockToken = {
  token: "mock-app-check-token",
  expireTimeMillis: Date.now() + 3600000, // 1 hour from now
  issuedAtTimeMillis: Date.now()
};

// Mock AppCheck instance
const mockAppCheck = {
  app: {},
  tokenObserver: null,
  isTokenAutoRefreshEnabled: true
};

// Public API implementations
export const initializeAppCheck = () => mockAppCheck;
export const getToken = () => Promise.resolve(mockToken);
export const onTokenChanged = () => () => {}; // Returns unsubscribe function
export const setTokenAutoRefreshEnabled = () => {};

// Provider classes
export class ReCaptchaV3Provider {
  constructor() {}
  getToken() { return Promise.resolve(mockToken); }
}

export class ReCaptchaEnterpriseProvider {
  constructor() {}
  getToken() { return Promise.resolve(mockToken); }
}

export class CustomProvider {
  constructor() {}
  getToken() { return Promise.resolve(mockToken); }
}

// Internal types
export class AppCheck {
  constructor() {}
  getToken() { return Promise.resolve(mockToken); }
}

export class AppCheckToken {
  constructor() {
    this.token = mockToken.token;
    this.expireTimeMillis = mockToken.expireTimeMillis;
    this.issuedAtTimeMillis = mockToken.issuedAtTimeMillis;
  }
}

// Internal functions that might be used
export function _getProvider() { return { getImmediate: () => mockAppCheck }; }
export function _registerComponent() { return {}; }
export function _getComponent() { return {}; }
export const _isFirebaseServerApp = () => false;
export const _AppCheckComponentName = "app-check";
export const _AppCheckInternalComponentName = "app-check-internal";

// Fake internal token provider to prevent initialization errors
export class __PRIVATE_FirebaseAppCheckTokenProvider {
  constructor() {}
  getToken() { return Promise.resolve(mockToken); }
  invalidateToken() {}
}

// Default export for ESM compatibility
export default {
  initializeAppCheck,
  getToken,
  onTokenChanged,
  setTokenAutoRefreshEnabled,
  ReCaptchaV3Provider,
  CustomProvider,
  ReCaptchaEnterpriseProvider,
  AppCheck,
  AppCheckToken,
  _getProvider,
  _registerComponent,
  _getComponent,
  _isFirebaseServerApp,
  _AppCheckComponentName,
  _AppCheckInternalComponentName,
  __PRIVATE_FirebaseAppCheckTokenProvider
}; 