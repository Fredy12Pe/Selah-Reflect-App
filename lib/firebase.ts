"use client";

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, Storage } from 'firebase/storage';
import { isBrowser, shouldSkipFirebaseInit } from '@/lib/utils/environment';

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
let storage: Storage | undefined = undefined;

// Safe initialization only in browser environment
if (isBrowser && !shouldSkipFirebaseInit) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('Firebase client initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase client:', error);
  }
}

export { app, auth, db, storage };

export const getFirebaseAuth = (): Auth | null => {
  if (shouldSkipFirebaseInit || !isBrowser) {
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
  if (shouldSkipFirebaseInit || !isBrowser) {
    console.log('Firebase Firestore access skipped during build or server rendering');
    return null;
  }
  
  if (!db) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
  }
  return db;
};

export const getFirebaseStorage = (): Storage | null => {
  if (shouldSkipFirebaseInit || !isBrowser) {
    console.log('Firebase Storage access skipped during build or server rendering');
    return null;
  }
  
  if (!storage) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    storage = getStorage(app);
  }
  return storage;
};

export const getGoogleAuthProvider = (): GoogleAuthProvider | null => {
  if (shouldSkipFirebaseInit || !isBrowser) {
    console.log('Google Auth Provider access skipped during build or server rendering');
    return null;
  }
  
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ 
    prompt: 'select_account',
    // Add additional OAuth scopes if needed
    // scope: 'profile email'
  });
  return provider;
};

// Storage utility functions
export const uploadDevotionPDF = async (date: string, file: File): Promise<string> => {
  if (shouldSkipFirebaseInit || !isBrowser) {
    console.log('Storage operation skipped during build or server rendering');
    return '#';
  }
  
  const storage = getFirebaseStorage();
  if (!storage) throw new Error('Storage not initialized');
  
  const devotionsRef = ref(storage, `devotions/${date}.pdf`);
  
  try {
    await uploadBytes(devotionsRef, file);
    const downloadURL = await getDownloadURL(devotionsRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw new Error('Failed to upload devotion PDF');
  }
};

export const getDevotionPDFUrl = async (date: string): Promise<string> => {
  if (shouldSkipFirebaseInit || !isBrowser) {
    console.log('Storage operation skipped during build or server rendering');
    return '#';
  }
  
  const storage = getFirebaseStorage();
  if (!storage) throw new Error('Storage not initialized');
  
  const devotionsRef = ref(storage, `devotions/${date}.pdf`);
  
  try {
    return await getDownloadURL(devotionsRef);
  } catch (error) {
    console.error('Error getting PDF URL:', error);
    throw new Error('Failed to get devotion PDF URL');
  }
}; 