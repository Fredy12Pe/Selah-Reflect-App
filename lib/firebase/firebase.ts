import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { isBrowser, shouldSkipFirebaseInit } from '../utils/environment';
import '../firebase/patch'; // Import patch before Firebase is initialized
import '../firebase/patchAuth'; // Import auth-specific patch

// Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Early debugging of environment vars
if (isBrowser()) {
  console.log('[Firebase Config] Environment Variables Present:', {
    apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
}

// Initialize Firebase (with error handling)
let app: FirebaseApp = {} as FirebaseApp;
let auth: Auth = {} as Auth;
let firestore: Firestore = {} as Firestore;
let storage: any = {};

try {
  // Skip initialization during server-side rendering or build
  if (typeof window === 'undefined' || shouldSkipFirebaseInit) {
    console.log('[Firebase] Skipping initialization (server context)');
    // Empty objects already initialized
  } 
  // Initialize in browser environment
  else {
    console.log('[Firebase] Initializing in browser environment');
    
    // Apply manual patches to global window object
    if (typeof window !== 'undefined') {
      // Ensure these essential functions exist
      window._isFirebaseServerApp = window._isFirebaseServerApp || function() { return false; };
      window._registerComponent = window._registerComponent || function(c) { return c; };
      window._getProvider = window._getProvider || function() { 
        return { getImmediate: () => ({}), get: () => ({}) }; 
      };
    }
    
    // Check if app is already initialized
    if (getApps().length === 0) {
      console.log('[Firebase] Creating new Firebase app instance');
      app = initializeApp(firebaseConfig);
    } else {
      console.log('[Firebase] Using existing Firebase app instance');
      app = getApps()[0];
    }
    
    // Initialize Firebase services
    console.log('[Firebase] Initializing Firebase Auth');
    auth = getAuth(app);
    
    console.log('[Firebase] Initializing Firestore');
    firestore = getFirestore(app);
    
    console.log('[Firebase] Initializing Storage');
    storage = getStorage(app);
    
    console.log('[Firebase] All services initialized successfully');
  }
} catch (error) {
  console.error('[Firebase] Initialization error:', error);
  // No need for fallbacks since variables are already initialized
}

// Add the utility functions that are imported elsewhere
export const getFirebaseAuth = (): Auth | null => {
  if (shouldSkipFirebaseInit || !isBrowser()) {
    console.log('Firebase Auth access skipped during build or server rendering');
    return null;
  }
  
  if (!auth) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
  }
  return auth;
};

export const getFirebaseDb = (): Firestore | null => {
  if (shouldSkipFirebaseInit || !isBrowser()) {
    console.log('Firebase Firestore access skipped during build or server rendering');
    return null;
  }
  
  if (!firestore) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    firestore = getFirestore(app);
  }
  return firestore;
};

export const getGoogleAuthProvider = (): GoogleAuthProvider | null => {
  if (shouldSkipFirebaseInit || !isBrowser()) {
    console.log('Google Auth Provider access skipped during build or server rendering');
    return null;
  }
  
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ 
    prompt: 'select_account',
  });
  return provider;
};

// Export the initialized Firebase instances
export { app, auth, firestore, storage }; 