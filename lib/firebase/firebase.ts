import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

// Log environment variables (without exposing sensitive values)
console.log('Firebase Config Environment Variables Present:', {
  apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only on the client side
let app;
let auth;
let db;

const initializeFirebase = async () => {
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

export function getFirebaseAuth() {
  if (typeof window === 'undefined') {
    console.log('Firebase: Attempted to get auth on server side');
    return null;
  }
  
  if (!auth) {
    console.log('Firebase: Auth not initialized, attempting initialization');
    initializeFirebase().catch(error => {
      console.error('Firebase: Failed to initialize when getting auth:', error);
    });
  } else {
    console.log('Firebase: Returning existing auth instance');
  }
  
  return auth;
}

export function getFirebaseDb() {
  if (typeof window === 'undefined') {
    console.log('Firebase: Attempted to get Firestore on server side');
    return null;
  }
  
  if (!db) {
    console.log('Firebase: Firestore not initialized, attempting initialization');
    initializeFirebase().catch(error => {
      console.error('Firebase: Failed to initialize when getting Firestore:', error);
    });
  } else {
    console.log('Firebase: Returning existing Firestore instance');
  }
  
  return db;
} 