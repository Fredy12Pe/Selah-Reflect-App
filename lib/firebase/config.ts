/**
 * Firebase Configuration
 * 
 * This is a browser-only implementation that safely initializes Firebase
 * without any Node.js dependencies.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
// Use safe storage without Node.js dependencies
import * as storage from './safeStorage';
import { isBrowser } from '../utils/environment';

// Patch to fix _registerComponent errors
if (typeof window !== 'undefined') {
  // @ts-ignore - Add missing internal functions to window
  window._registerComponent = window._registerComponent || function(component) {
    console.log('[Firebase Patch] Mock _registerComponent called');
    return component;
  };
  
  // @ts-ignore
  window._isFirebaseServerApp = window._isFirebaseServerApp || function() {
    return false;
  };
  
  // @ts-ignore
  window._getProvider = window._getProvider || function() {
    return {
      getImmediate: () => ({}),
      get: () => ({})
    };
  };
}

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Log environment variables for debugging (without exposing actual values)
console.log('[Firebase Config] Environment Variables Present:', {
  apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

// Default empty values for server-side rendering
let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

// Only initialize in browser environment
if (isBrowser()) {
  try {
    console.log('[Firebase] Initializing in browser environment');
    
    // Initialize Firebase app
    if (getApps().length === 0) {
      console.log('[Firebase] Creating new Firebase app instance');
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      console.log('[Firebase] Using existing Firebase app instance');
      firebaseApp = getApp();
    }
    
    // Initialize Auth
    console.log('[Firebase] Initializing Auth');
    auth = getAuth(firebaseApp);
    
    // Initialize Firestore - without persistence to avoid errors
    console.log('[Firebase] Initializing Firestore');
    db = getFirestore(firebaseApp);
    
    console.log('[Firebase] All services initialized successfully');
  } catch (error) {
    console.error('[Firebase] Initialization error:', error);
    
    // Create empty objects as fallbacks if initialization fails
    firebaseApp = firebaseApp || ({} as FirebaseApp);
    auth = auth || ({} as Auth);
    db = db || ({} as Firestore);
  }
} else {
  console.log('[Firebase] Skipping initialization (server context)');
}

export { firebaseApp, auth, db, storage, firebaseConfig }; 