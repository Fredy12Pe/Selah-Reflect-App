/**
 * Enhanced Firebase Global Patch Script
 * 
 * This script is loaded directly in the browser, outside of the React application,
 * to ensure that critical Firebase functions are available before any Firebase code runs.
 */

(function() {
  console.log('[Firebase Global Patch] Applying patches to global scope...');
  
  // Create visual debug output for troubleshooting
  function createDebugOutput() {
    // Only create if not already exists
    if (document.getElementById('firebase-debug-panel')) return;
    
    const debugEl = document.createElement('div');
    debugEl.id = 'firebase-debug-panel';
    debugEl.style.position = 'fixed';
    debugEl.style.zIndex = '99999';
    debugEl.style.bottom = '10px';
    debugEl.style.left = '10px';
    debugEl.style.background = 'rgba(0,0,0,0.8)';
    debugEl.style.color = 'white';
    debugEl.style.padding = '10px';
    debugEl.style.borderRadius = '5px';
    debugEl.style.fontFamily = 'monospace';
    debugEl.style.fontSize = '12px';
    debugEl.style.maxWidth = '400px';
    debugEl.style.maxHeight = '200px';
    debugEl.style.overflow = 'auto';
    
    document.body.appendChild(debugEl);
    return debugEl;
  }
  
  // Log to debug panel
  function logToPanel(message, type = 'info') {
    console.log(`[Firebase Fix] ${message}`);
    
    // Don't try to create UI elements if document not ready
    if (!document.body) return;
    
    const panel = document.getElementById('firebase-debug-panel') || createDebugOutput();
    const entry = document.createElement('div');
    entry.style.marginBottom = '5px';
    entry.style.color = type === 'error' ? '#ff5555' : 
                         type === 'warning' ? '#ffaa00' : 
                         type === 'success' ? '#55ff55' : '#ffffff';
    entry.textContent = message;
    panel.appendChild(entry);
  }
  
  // Patch the essential Firebase functions
  window._isFirebaseServerApp = function() {
    logToPanel('Mock _isFirebaseServerApp called');
    return false;
  };
  
  window._registerComponent = function(component) {
    logToPanel(`Mock _registerComponent called for: ${component?.name}`);
    return component;
  };
  
  window._getProvider = function(name) {
    logToPanel(`Mock _getProvider called for: ${name}`);
    return {
      getImmediate: function() { return {}; },
      get: function() { return {}; }
    };
  };
  
  window._registerVersion = function(name, version) {
    logToPanel(`Mock _registerVersion called: ${name} ${version}`);
  };
  
  window._getComponent = function(name) {
    logToPanel(`Mock _getComponent called: ${name}`);
    return {};
  };
  
  // Monitor early errors
  window.addEventListener('error', function(event) {
    logToPanel(`Error: ${event.message}`, 'error');
  });
  
  // Patch specific webpack module names that might be used
  window.__FIREBASE_APP__WEBPACK_IMPORTED_MODULE_3__ = window.__FIREBASE_APP__WEBPACK_IMPORTED_MODULE_3__ || {};
  window.__FIREBASE_APP__WEBPACK_IMPORTED_MODULE_3__._isFirebaseServerApp = function() {
    return false;
  };
  
  // Also patch other potential webpack module name patterns
  for (let i = 0; i < 20; i++) {
    const modName = `__FIREBASE_APP__WEBPACK_IMPORTED_MODULE_${i}__`;
    window[modName] = window[modName] || {};
    window[modName]._isFirebaseServerApp = function() { return false; };
    window[modName]._registerComponent = function(c) { return c; };
    window[modName]._getProvider = function() { 
      return { getImmediate: () => ({}), get: () => ({}) }; 
    };
  }
  
  // Monitor loading state
  let checkCount = 0;
  function checkLoadingState() {
    checkCount++;
    if (checkCount > 20) return; // Stop after 20 attempts
    
    // Check if firebase is loaded
    if (typeof firebase !== 'undefined') {
      logToPanel('Firebase object loaded successfully!', 'success');
    } else if (checkCount > 10) {
      logToPanel('Firebase object not loaded after multiple attempts', 'error');
    }
    
    // Check for React load
    const reactRoot = document.getElementById('__next') || document.getElementById('root');
    if (reactRoot) {
      logToPanel('React app loaded', 'success');
    }
    
    // Continue checking
    setTimeout(checkLoadingState, 1000);
  }
  
  // Start monitoring after a short delay
  setTimeout(checkLoadingState, 1000);
  
  logToPanel('Firebase Global Patch successfully applied', 'success');
})(); 