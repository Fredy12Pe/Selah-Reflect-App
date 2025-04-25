/**
 * Firebase App Shim
 * 
 * This module wraps the original firebase/app module but adds our
 * custom implementations to prevent errors.
 */

// Re-export all exports from the original firebase/app module
export * from 'firebase/app';

// Import the original module for enhancing
import * as firebaseApp from 'firebase/app';

// Mock component class
class Component {
  constructor(name, instanceFactory, type) {
    this.name = name;
    this.instanceFactory = instanceFactory;
    this.type = type;
    this.multipleInstances = false;
    this.serviceProps = {};
    this.instantiationMode = "LAZY";
    this.onInstanceCreated = null;
  }
}

// Mock internal functions that the Firebase Auth module uses
export const _registerComponent = (component) => {
  console.log(`[Firebase Shim] Registering component: ${component.name}`);
  return component;
};

export const _getProvider = (name) => {
  return {
    getImmediate: () => ({}),
    get: () => ({}),
  };
};

export const _registerVersion = (packageName, version, variant) => {
  console.log(`[Firebase Shim] Registering version: ${packageName}@${version}${variant ? ` ${variant}` : ''}`);
};

export const _getComponent = (name) => new Component(name, () => ({}), "PUBLIC");

export const _isFirebaseServerApp = () => false;

// Add a mock implementation for internal Firebase App Check functions
export class __PRIVATE_FirebaseAppCheckTokenProvider {
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
}

// Internal firebase app components
export const _components = new Map();
export const _addComponent = (app, component) => {
  _components.set(component.name, component);
  return component;
};
export const _addOrOverwriteComponent = (app, component) => {
  _components.set(component.name, component);
  return component;
};
export const _apps = new Map();
export const _clearComponents = () => _components.clear();

// Default export to maintain compatibility
const enhancedFirebaseApp = {
  ...firebaseApp,
  _registerComponent,
  _getProvider,
  _registerVersion,
  _getComponent,
  _isFirebaseServerApp,
  __PRIVATE_FirebaseAppCheckTokenProvider,
  _components,
  _addComponent,
  _addOrOverwriteComponent,
  _apps,
  _clearComponents,
  // Add any other internal functions that Firebase Auth might use
  Component
};

export default enhancedFirebaseApp; 