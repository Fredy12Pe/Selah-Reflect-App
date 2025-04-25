import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from 'firebase/firestore';
import { getStorage } from '../firebase/storage-patch';
import { checkFirebaseConfig } from './checkConfig';
import { isBrowser } from '../utils/environment';

// Log environment variables (without exposing sensitive values)
console.log('Firebase Config Environment Variables Present:', {
  apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

// Add firebaseConfig export after the environment variable logging
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: any | undefined;

// Initialize Firebase only in browser environments
if (isBrowser()) {
  try {
    console.log('Firebase: Initializing in browser environment');
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log('Firebase: Successfully initialized in browser');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (!isBrowser()) {
    throw new Error('Firebase is not available in non-browser environments');
  }

  if (!app) {
    const { hasIssues, issues, config } = checkFirebaseConfig();
    
    if (hasIssues) {
      console.error('Firebase configuration issues detected:');
      issues.forEach(issue => console.error('- ' + issue));
      console.error('Configuration status:', config);
      throw new Error('Invalid Firebase configuration');
    }

    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      console.log('Firebase app initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase app:', error);
      throw error;
    }
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!isBrowser()) {
    throw new Error('Firebase Auth is not available in non-browser environments');
  }

  if (!auth) {
    const currentApp = getFirebaseApp();
    try {
      auth = getAuth(currentApp);
      console.log('Firebase auth initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase auth:', error);
      throw error;
    }
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!isBrowser()) {
    throw new Error('Firebase Firestore is not available in non-browser environments');
  }

  if (!db) {
    const currentApp = getFirebaseApp();
    try {
      db = initializeFirestore(currentApp, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
      console.log('Firestore initialized successfully with persistence');
    } catch (error) {
      console.error('Error initializing Firestore:', error);
      throw error;
    }
  }
  return db;
}

export function getFirebaseStorage(): any {
  if (!isBrowser()) {
    throw new Error('Firebase Storage is not available in non-browser environments');
  }

  if (!storage) {
    const currentApp = getFirebaseApp();
    try {
      storage = getStorage(currentApp);
      console.log('Firebase storage initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase storage:', error);
      throw error;
    }
  }
  return storage;
}

export { app, db, auth, storage }; 