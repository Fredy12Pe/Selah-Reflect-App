/**
 * Simple test script for environment utilities in server environment
 */

// No window mock - simulating server environment

// Basic implementation of environment utilities
const isBrowser = () => typeof window !== 'undefined';
const shouldSkipFirebaseInit = process.env.SKIP_FIREBASE_INIT_ON_BUILD === 'true' && !isBrowser();

// Test the utilities
console.log('Server Environment Test Results:');
console.log('isBrowser():', isBrowser());
console.log('window object exists:', typeof window !== 'undefined');
console.log('shouldSkipFirebaseInit:', shouldSkipFirebaseInit);
console.log('SKIP_FIREBASE_INIT_ON_BUILD:', process.env.SKIP_FIREBASE_INIT_ON_BUILD); 