/**
 * Firebase Firestore Shim
 * 
 * This module wraps the original firebase/firestore module but prevents
 * App Check integration errors.
 */

// Import directly from firebase/firestore
import * as firestoreModule from 'firebase/firestore';

// Explicitly re-export all functions from the original module
export const {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  enableIndexedDbPersistence,
  disableNetwork,
  enableNetwork,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
  collectionGroup,
  connectFirestoreEmulator,
  CACHE_SIZE_UNLIMITED,
  enableMultiTabIndexedDbPersistence,
  getDocFromCache,
  getDocsFromCache,
  loadBundle,
  namedQuery,
  waitForPendingWrites,
  refEqual,
  deleteField,
  FieldValue,
  FieldPath,
  Bytes,
  GeoPoint,
  setLogLevel,
  onSnapshotsInSync,
  WithFieldValue,
  DocumentReference,
  Query,
  QuerySnapshot,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  DocumentData,
  FirestoreError,
  FirestoreErrorCode,
  /* add any additional exports your app uses */
} = firestoreModule;

// Mock the internal App Check integration
export const __PRIVATE_useAppCheckTokenProvider = () => {
  return {
    getToken: () => Promise.resolve({ token: "mock-app-check-token" }),
    invalidateToken: () => {}
  };
};

// Add additional internal functions that might be used
export const _isFirebaseServerApp = () => false;
export const _AppCheckComponentName = "app-check";
export const _getProvider = () => ({
  getImmediate: () => ({
    getToken: () => Promise.resolve({ token: "mock-app-check-token" }),
  })
});

// Create enhanced default export with our custom implementations
const enhancedFirestore = {
  ...firestoreModule,
  __PRIVATE_useAppCheckTokenProvider,
  _isFirebaseServerApp,
  _AppCheckComponentName,
  _getProvider
};

export default enhancedFirestore; 