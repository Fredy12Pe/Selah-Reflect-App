/**
 * Firebase Universal Override
 * 
 * This is a global shim that patches the internal functions of Firebase
 * to prevent errors during client-side rendering.
 */

// Create mock utility function
const createMockFunction = (name) => {
  return (...args) => {
    console.log(`[Firebase Override] Called mock function: ${name}`, ...args);
    return args[0]; // Often returning the first arg works for component functions
  };
};

// Create complete mock firebase app
const createMockFirebaseApp = () => ({
  name: '[DEFAULT]',
  options: {},
  automaticDataCollectionEnabled: false,
  // Add more properties as needed
});

// Create a complete mock auth instance
const createMockAuth = () => ({
  currentUser: null,
  onAuthStateChanged: (cb) => { 
    setTimeout(() => cb(null), 0);
    return () => {};
  },
  signInWithRedirect: () => Promise.resolve(),
  signInWithPopup: () => Promise.resolve({ user: null }),
  signOut: () => Promise.resolve(),
  // Add more auth methods as needed
});

// Create a mock Firestore instance
const createMockFirestore = () => ({
  collection: (path) => ({
    doc: (id) => ({
      get: () => Promise.resolve({
        exists: false,
        data: () => null
      }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve()
    }),
    where: () => ({
      get: () => Promise.resolve({
        empty: true,
        docs: []
      })
    })
  }),
  // Add more Firestore methods as needed
});

// Create global mocks
const _registerComponent = createMockFunction('_registerComponent');
const _getProvider = (name) => ({
  getImmediate: () => {
    // Return different mock instances based on the service name
    if (name === 'auth') return createMockAuth();
    if (name === 'firestore') return createMockFirestore();
    if (name === 'app') return createMockFirebaseApp();
    return {};
  },
  get: () => ({})
});
const _registerVersion = createMockFunction('_registerVersion');
const _getComponent = createMockFunction('_getComponent');
const _isFirebaseServerApp = () => false;
const _components = new Map();
const _addComponent = createMockFunction('_addComponent');
const _addOrOverwriteComponent = createMockFunction('_addOrOverwriteComponent');
const _apps = new Map();
const _clearComponents = () => _components.clear();

// Firebase App Check token provider mock
const __PRIVATE_FirebaseAppCheckTokenProvider = class {
  constructor() {
    this.app = {};
    this.appCheck = null;
  }

  getToken() {
    return Promise.resolve({
      token: "mock-app-check-token",
      expirationTime: new Date(Date.now() + 3600000)
    });
  }

  invalidateToken() {}
};

// Auth specific mocks
const registerAuth = () => ({
  type: 'PUBLIC',
  name: 'auth',
  instance: createMockAuth(),
  onInstanceCreated: (container, instanceIdentifier, instance) => {
    return Promise.resolve(instance);
  }
});

// Export all mocks for use in other modules
export {
  _registerComponent,
  _getProvider,
  _registerVersion,
  _getComponent,
  _isFirebaseServerApp,
  _components,
  _addComponent,
  _addOrOverwriteComponent,
  _apps,
  _clearComponents,
  __PRIVATE_FirebaseAppCheckTokenProvider,
  registerAuth,
  createMockFirebaseApp,
  createMockAuth,
  createMockFirestore
};

// Apply patches to global objects if running in browser
if (typeof window !== 'undefined') {
  // Patch window for firebase access
  window.__firebase_mocks = {
    _registerComponent,
    _getProvider,
    _registerVersion,
    _getComponent,
    _isFirebaseServerApp,
    _components,
    _addComponent,
    _addOrOverwriteComponent,
    _apps,
    _clearComponents,
    __PRIVATE_FirebaseAppCheckTokenProvider,
    registerAuth
  };
  
  // Create a proxy to intercept and fix module access
  const originalRequire = window.require;
  if (originalRequire) {
    window.require = function(moduleName) {
      if (moduleName.includes('firebase') || moduleName.includes('auth') || moduleName.includes('firestore')) {
        console.log(`[Firebase Override] Intercepted require for module: ${moduleName}`);
        return window.__firebase_mocks;
      }
      return originalRequire.apply(this, arguments);
    };
  }
}

// Default export with all mocks
export default {
  _registerComponent,
  _getProvider,
  _registerVersion,
  _getComponent,
  _isFirebaseServerApp,
  _components,
  _addComponent,
  _addOrOverwriteComponent,
  _apps,
  _clearComponents,
  __PRIVATE_FirebaseAppCheckTokenProvider,
  registerAuth
}; 