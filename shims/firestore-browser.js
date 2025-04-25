// Firestore browser shim to handle server-side imports
// This redirects to the browser version instead of the Node.js version

export * from '@firebase/firestore';

// Add a mock for _isFirebaseServerApp since it's missing from the browser version
export const _isFirebaseServerApp = false;