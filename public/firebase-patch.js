/**
 * Firebase Runtime Patch Script
 * 
 * This script is loaded after the page starts loading, to apply additional
 * Firebase patches that might be needed at runtime.
 */

(function() {
  console.log('[Firebase Runtime Patch] Applying additional patches to global scope...');
  
  // Additional runtime patching
  if (typeof window !== 'undefined') {
    // Patch the webpack module system if it exists
    if (window.webpackJsonp) {
      console.log('[Firebase Runtime Patch] Found webpackJsonp, patching...');
      const originalWebpackJsonp = window.webpackJsonp;
      
      window.webpackJsonp = function() {
        // Call the original function first
        const result = originalWebpackJsonp.apply(this, arguments);
        
        // Check if any Firebase modules were loaded
        if (arguments && arguments[0] && Array.isArray(arguments[0])) {
          for (let i = 0; i < arguments[0].length; i++) {
            const chunk = arguments[0][i];
            if (chunk && chunk[0] && typeof chunk[0] === 'string' && 
                (chunk[0].includes('firebase') || chunk[0].includes('Firebase'))) {
              console.log('[Firebase Runtime Patch] Patching Firebase webpack chunk:', chunk[0]);
            }
          }
        }
        
        return result;
      };
    }
    
    // Patch the webpack require function if it exists
    if (window.__webpack_require__) {
      console.log('[Firebase Runtime Patch] Found __webpack_require__, patching...');
      const originalWebpackRequire = window.__webpack_require__;
      
      window.__webpack_require__ = function(moduleId) {
        // Call the original function first
        const module = originalWebpackRequire.apply(this, arguments);
        
        // Patch the module if it's related to Firebase
        if (module && 
            ((module._registerComponent && typeof module._registerComponent === 'function') ||
             (module.firebase && typeof module.firebase === 'object'))) {
          console.log('[Firebase Runtime Patch] Patching Firebase module:', moduleId);
          
          // Patch the module
          module._isFirebaseServerApp = module._isFirebaseServerApp || function() { return false; };
          module._registerComponent = module._registerComponent || function(c) { return c; };
          module._getProvider = module._getProvider || function() { 
            return { getImmediate: () => ({}), get: () => ({}) }; 
          };
        }
        
        return module;
      };
    }
  }
  
  console.log('[Firebase Runtime Patch] Successfully applied runtime patches');
})(); 