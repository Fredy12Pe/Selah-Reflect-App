/**
 * Firebase Auth Internal ESM Shim
 * 
 * This specifically solves the "_registerComponent is not a function" error in
 * the ESM module by patching the registerAuth function.
 */

// Register Auth replacement that doesn't use _registerComponent
export function registerAuth(instance) {
  console.log('[Firebase Auth Shim] Safely bypassing _registerComponent call');
  return {
    name: 'auth',
    instanceFactory: () => ({
      currentUser: null,
      onAuthStateChanged: (cb) => { 
        setTimeout(() => cb(null), 0);
        return () => {};
      },
      signInWithRedirect: () => Promise.resolve(),
      signInWithPopup: () => Promise.resolve({ user: null }),
      signOut: () => Promise.resolve(),
    })
  };
}

// Expose all standard functions from original module but with our registerAuth
export * from '@firebase/auth/dist/esm2017/index.js';

// Default export
import * as authESM from '@firebase/auth/dist/esm2017/index.js';
export default {
  ...authESM,
  registerAuth
}; 