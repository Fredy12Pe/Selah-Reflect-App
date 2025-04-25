import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { checkFirebaseConfig } from './checkConfig';

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

export function getFirebaseApp(): FirebaseApp {
  const { hasIssues, issues, config } = checkFirebaseConfig();
  
  if (hasIssues) {
    console.error('Firebase configuration issues detected:');
    issues.forEach(issue => console.error('- ' + issue));
    console.error('Configuration status:', config);
    throw new Error('Invalid Firebase configuration');
  }

  if (!app) {
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

const initializeFirebase = async (): Promise<FirebaseApp | null> => {
  if (typeof window === 'undefined') {
    console.log('Firebase: Skipping initialization on server side');
    return null;
  }

  try {
    // Check if config is valid
    console.log('Firebase: Validating configuration');
    const missingKeys = Object.entries(firebaseConfig)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingKeys.length > 0) {
      throw new Error(`Missing Firebase configuration keys: ${missingKeys.join(', ')}`);
    }

    console.log('Firebase: Starting initialization');
    
    // Initialize or get existing Firebase app
    if (!app) {
      console.log('Firebase: Creating new app instance');
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      console.log('Firebase: App initialized successfully');
    } else {
      console.log('Firebase: Using existing app instance');
    }

    // Initialize Auth with persistence
    if (!auth) {
      console.log('Firebase: Initializing Auth');
      auth = getAuth(app);
      await setPersistence(auth, browserLocalPersistence);
      console.log('Firebase: Auth initialized with persistence');
    } else {
      console.log('Firebase: Using existing Auth instance');
    }

    // Initialize Firestore with persistence
    if (!db) {
      console.log('Firebase: Initializing Firestore');
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
      console.log('Firebase: Firestore initialized with persistence');
    } else {
      console.log('Firebase: Using existing Firestore instance');
    }

    // Initialize Storage if needed
    if (!storage) {
      console.log('Firebase: Initializing Storage');
      storage = getStorage(app);
      console.log('Firebase: Storage initialized');
    } else {
      console.log('Firebase: Using existing Storage instance');
    }

    // Set up auth state listener to handle token refresh
    onAuthStateChanged(auth, async (user: User | null) => {
      console.log('Auth state changed:', user ? `User ${user.uid} logged in` : 'User logged out');
      if (user) {
        try {
          // Force token refresh
          const token = await user.getIdToken(true);
          console.log('Firebase token refreshed successfully');
          // Log user claims
          const idTokenResult = await user.getIdTokenResult();
          console.log('User claims:', idTokenResult.claims);
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      }
    });

    return app;
  } catch (error) {
    console.error('Firebase: Initialization error:', error);
    throw error;
  }
};

// Initialize Firebase on import
if (typeof window !== 'undefined') {
  console.log('Firebase: Attempting initialization on import');
  initializeFirebase().catch(error => {
    console.error('Firebase: Failed to initialize on import:', error);
  });
}

export function getFirebaseAuth(): Auth {
  const app = getFirebaseApp();
  try {
    if (!auth) {
      auth = getAuth(app);
      console.log('Firebase auth initialized successfully');
    }
    return auth;
  } catch (error) {
    console.error('Error initializing Firebase auth:', error);
    throw error;
  }
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    const app = getFirebaseApp();
    try {
      db = initializeFirestore(app, {
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
  if (!storage) {
    const app = getFirebaseApp();
    try {
      storage = getStorage(app);
      console.log('Firebase storage initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase storage:', error);
      throw error;
    }
  }
  return storage;
} 