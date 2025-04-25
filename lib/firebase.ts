"use client";

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { isBrowser, shouldSkipFirebaseInit } from '@/lib/utils/environment';

// Import safe storage from our module instead
import * as safeStorage from './firebase/safeStorage';

// Import from config (for re-export)
import { firebaseApp, auth as configAuth, db as configDb, storage as configStorage } from './firebase/config';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only in browser environment
let app: FirebaseApp | undefined = undefined;
let auth: Auth | undefined = undefined;
let db: Firestore | undefined = undefined;
let storage = safeStorage;

// Safe initialization only in browser environment
if (isBrowser() && !shouldSkipFirebaseInit) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase client initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase client:', error);
  }
}

// Export our local firebase instances
export { app, auth, db, storage };

// Re-export from config file
export { firebaseApp, configAuth as configAuth, configDb as configDb, configStorage as configStorage };

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
  
  if (!db) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
  }
  return db;
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

// Storage utility functions
export const uploadDevotionPDF = async (date: string, file: File): Promise<string> => {
  if (shouldSkipFirebaseInit || !isBrowser()) {
    console.log('Storage operation skipped during build or server rendering');
    return '#';
  }
  
  try {
    // Just return a placeholder URL since we're using mock storage
    return `/api/devotions/${date}/pdf`;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw new Error('Failed to upload devotion PDF');
  }
};

export const getDevotionPDFUrl = async (date: string): Promise<string> => {
  if (shouldSkipFirebaseInit || !isBrowser()) {
    console.log('Storage operation skipped during build or server rendering');
    return '#';
  }
  
  try {
    // Just return a placeholder URL since we're using mock storage
    return `/api/devotions/${date}/pdf`;
  } catch (error) {
    console.error('Error getting PDF URL:', error);
    throw new Error('Failed to get devotion PDF URL');
  }
};

/**
 * Safe utility functions that work both client and server-side
 */
export const getAppSafe = () => {
  if (typeof window === 'undefined') return null;
  return app;
};

export const getAuthSafe = () => {
  if (typeof window === 'undefined') return null;
  return auth;
};

export const getDbSafe = () => {
  if (typeof window === 'undefined') return null;
  return db;
};

export const getStorageSafe = () => {
  if (typeof window === 'undefined') return null;
  return storage;
}; 