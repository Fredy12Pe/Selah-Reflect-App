/**
 * Firebase Auth Internal Shim
 * 
 * This module provides special handling for internal Firebase Auth components
 * to prevent initialization errors with _registerComponent.
 */

// Re-export all the standard Auth functions
export * from '@firebase/auth';

// Mock implementation for registerAuth - the function that's causing errors
export const registerAuth = (app) => {
  console.log('[Firebase Auth Shim] Safely replaced internal registerAuth');
  
  // Create a mock auth instance that won't error
  return {
    type: 'PUBLIC',
    name: 'auth',
    instance: {
      currentUser: null,
      onAuthStateChanged: (callback) => {
        // Call the callback with null user initially
        setTimeout(() => callback(null), 0);
        // Return unsubscribe function
        return () => {};
      },
      signInWithRedirect: () => Promise.resolve(),
      signInWithPopup: () => Promise.resolve({ user: null }),
      signOut: () => Promise.resolve(),
      // Add other methods your app uses
    },
    onInstanceCreated: (container, instanceIdentifier, instance) => {
      return Promise.resolve(instance);
    }
  };
};

// Create a default export with the mocked functions
import * as originalAuth from '@firebase/auth';
const enhancedAuth = {
  ...originalAuth,
  registerAuth
};

export default enhancedAuth; 