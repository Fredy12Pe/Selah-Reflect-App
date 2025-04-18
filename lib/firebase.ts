"use client";

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, Storage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
let auth = getAuth(app);
let db = getFirestore(app);
let storage = getStorage(app);

export { app, auth, db, storage };

export const getFirebaseAuth = () => {
  if (!auth) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
  }
  return auth;
};

export const getFirebaseDb = () => {
  if (!db) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
  }
  return db;
};

export const getFirebaseStorage = () => {
  if (!storage) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    storage = getStorage(app);
  }
  return storage;
};

export const getGoogleAuthProvider = () => {
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
  const storage = getFirebaseStorage();
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
  const storage = getFirebaseStorage();
  const devotionsRef = ref(storage, `devotions/${date}.pdf`);
  
  try {
    return await getDownloadURL(devotionsRef);
  } catch (error) {
    console.error('Error getting PDF URL:', error);
    throw new Error('Failed to get devotion PDF URL');
  }
}; 