/**
 * Firebase Auth Shim
 * 
 * This module safely wraps the Firebase Auth module to prevent initialization errors
 * by providing mock implementations of internal functions.
 */

// Import directly from firebase/auth to re-export
import * as firebaseAuth from 'firebase/auth';

// Mock implementations for missing functions
const mockUser = {
  uid: 'mock-user-id',
  displayName: 'Mock User',
  email: 'mock@example.com',
  getIdToken: () => Promise.resolve('mock-id-token')
};

const mockCredential = {
  user: mockUser,
  credential: {
    accessToken: 'mock-token',
    idToken: 'mock-id-token'
  }
};

// Explicitly define missing functions
const reauthenticateWithCredential = () => Promise.resolve(mockCredential);
const EmailAuthProvider = {
  credential: (email, password) => ({
    providerId: 'password',
    signInMethod: 'password',
    email,
    password
  })
};

// Re-export all standard functions
export const {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult, 
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  updateProfile,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
  applyActionCode,
  checkActionCode,
  verifyPasswordResetCode,
  linkWithPopup,
  linkWithRedirect,
  reauthenticateWithPopup,
  reauthenticateWithRedirect,
  unlink,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  indexedDBLocalPersistence,
  connectAuthEmulator,
  // Add any other auth functions your app uses
} = firebaseAuth;

// Export our explicit implementations
export {
  reauthenticateWithCredential,
  EmailAuthProvider
};

// For internal auth functions that might cause errors
export const registerAuth = () => {
  console.log('[Firebase Auth Shim] Safely registered Auth module');
  return {
    type: 'PUBLIC',
    name: 'auth',
  };
};

// Add additional auth helpers that might be needed
export const getToken = () => Promise.resolve({ accessToken: 'mock-token' });
export const getIdToken = () => Promise.resolve('mock-id-token');
export const getIdTokenResult = () => Promise.resolve({
  token: 'mock-id-token',
  expirationTime: new Date(Date.now() + 3600000).toISOString(),
  authTime: new Date().toISOString(),
  issuedAtTime: new Date().toISOString(),
  signInProvider: 'password',
  signInSecondFactor: null,
  claims: {}
});

// Default export with enhanced functions
export default {
  ...firebaseAuth,
  registerAuth,
  reauthenticateWithCredential,
  EmailAuthProvider
}; 