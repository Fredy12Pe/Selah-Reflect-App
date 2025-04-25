/**
 * Firebase Global Patch Script
 * 
 * This script is loaded directly in the browser, outside of the React application,
 * to ensure that critical Firebase functions are available before any Firebase code runs.
 */

(function() {
  console.log('[Firebase Global Patch] Applying patches to global scope...');
  
  // Patch the essential Firebase functions
  window._isFirebaseServerApp = function() {
    console.log('[Firebase Patch] Mock _isFirebaseServerApp called');
    return false;
  };
  
  window._registerComponent = function(component) {
    console.log('[Firebase Patch] Mock _registerComponent called for:', component?.name);
    return component;
  };
  
  window._getProvider = function(name) {
    console.log('[Firebase Patch] Mock _getProvider called for:', name);
    return {
      getImmediate: function() { return {}; },
      get: function() { return {}; }
    };
  };
  
  window._registerVersion = function() {
    // No-op function
  };
  
  window._getComponent = function() {
    return {};
  };
  
  // Patch specific webpack module names that might be used
  // This is the expression that fails in the error message
  window.__FIREBASE_APP__WEBPACK_IMPORTED_MODULE_3__ = window.__FIREBASE_APP__WEBPACK_IMPORTED_MODULE_3__ || {};
  window.__FIREBASE_APP__WEBPACK_IMPORTED_MODULE_3__._isFirebaseServerApp = function() {
    return false;
  };
  
  // Also patch other potential webpack module name patterns
  for (let i = 0; i < 10; i++) {
    const modName = `__FIREBASE_APP__WEBPACK_IMPORTED_MODULE_${i}__`;
    window[modName] = window[modName] || {};
    window[modName]._isFirebaseServerApp = function() { return false; };
    window[modName]._registerComponent = function(c) { return c; };
  }
  
  console.log('[Firebase Global Patch] Successfully applied all patches to window object');
})(); 