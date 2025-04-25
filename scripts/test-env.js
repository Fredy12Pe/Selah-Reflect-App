/**
 * Simple test script for environment utilities
 */

// Mock window for browser environment testing
global.window = {};

// Basic implementation of environment utilities
const isBrowser = () => typeof window !== 'undefined';
const shouldSkipFirebaseInit = process.env.SKIP_FIREBASE_INIT_ON_BUILD === 'true' && !isBrowser();

// Test the utilities
console.log('Environment Test Results:');
console.log('isBrowser():', isBrowser());
console.log('window object exists:', typeof window !== 'undefined');
console.log('shouldSkipFirebaseInit:', shouldSkipFirebaseInit);
console.log('SKIP_FIREBASE_INIT_ON_BUILD:', process.env.SKIP_FIREBASE_INIT_ON_BUILD); 