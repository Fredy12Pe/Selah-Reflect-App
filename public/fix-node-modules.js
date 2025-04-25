/**
 * Fix Node.js Module Imports
 * 
 * This script patches global imports for node: prefixed modules
 * to use browser-compatible versions instead
 */

(function() {
  console.log('[Node Modules Fix] Applying patches for node: imports...');
  
  // Create a mapping for node: prefixed modules
  const nodeModules = {
    'node:events': 'events',
    'node:stream': 'stream-browserify',
    'node:util': 'util',
    'node:buffer': 'buffer',
    'node:path': 'path-browserify',
    'node:crypto': 'crypto-browserify',
    'node:fs': null, // Not available in browser
    'node:http': 'stream-http',
    'node:https': 'https-browserify',
    'node:zlib': 'browserify-zlib',
    'node:os': 'os-browserify/browser',
    'node:console': 'console-browserify',
    'node:net': false,
    'node:tls': false,
    'node:child_process': false,
    'node:worker_threads': false,
    'node:process': false,
    'node:assert': 'assert'
  };
  
  // Add mock implementation of these modules to window
  window.events = window.events || {
    EventEmitter: function() {
      return {
        on: function() {},
        once: function() {},
        emit: function() {},
        addListener: function() {},
        removeListener: function() {},
        removeAllListeners: function() {}
      };
    }
  };
  
  window.stream = window.stream || {
    Readable: function() { return {}; },
    Writable: function() { return {}; },
    Transform: function() { return {}; },
    Duplex: function() { return {}; }
  };
  
  window.util = window.util || {
    inherits: function() {},
    promisify: function(fn) { return fn; },
    types: {
      isDate: function() { return false; },
      isRegExp: function() { return false; }
    }
  };
  
  // Mock require function to intercept node: imports
  const originalRequire = window.require;
  if (typeof originalRequire === 'function') {
    window.require = function(moduleName) {
      console.log('[Node Modules Fix] Intercepted require:', moduleName);
      
      // Check if this is a node: prefixed module
      if (moduleName.startsWith('node:')) {
        const browserModule = nodeModules[moduleName];
        
        if (browserModule === false) {
          console.warn('[Node Modules Fix] Module not available in browser:', moduleName);
          // Return mock implementation
          if (moduleName === 'node:events') return window.events;
          if (moduleName === 'node:stream') return window.stream;
          if (moduleName === 'node:util') return window.util;
          return {}; // Empty mock for other modules
        }
        
        if (browserModule === null) {
          console.warn('[Node Modules Fix] Module not available in browser:', moduleName);
          return {}; // Return empty object for unavailable modules
        }
        
        if (browserModule) {
          console.log('[Node Modules Fix] Redirecting to browser module:', browserModule);
          return originalRequire(browserModule);
        }
      }
      
      // Special cases for non-prefixed modules
      if (moduleName === 'events') return window.events;
      if (moduleName === 'stream') return window.stream;
      if (moduleName === 'util') return window.util;
      
      // Pass through for regular modules
      return originalRequire(moduleName);
    };
  } else {
    // If require isn't available yet, create a mock version
    window.require = function(moduleName) {
      console.log('[Node Modules Fix] Mock require called:', moduleName);
      
      if (moduleName.startsWith('node:') || 
          moduleName === 'events' || 
          moduleName === 'stream' || 
          moduleName === 'util') {
          
        if (moduleName === 'node:events' || moduleName === 'events') return window.events;
        if (moduleName === 'node:stream' || moduleName === 'stream') return window.stream;
        if (moduleName === 'node:util' || moduleName === 'util') return window.util;
        
        return {}; // Return empty object for other modules
      }
      
      console.warn('[Node Modules Fix] Cannot load module (require not available):', moduleName);
      return {};
    };
  }
  
  // Also patch dynamic imports for newer code
  const originalImport = window.import;
  if (typeof originalImport === 'function') {
    window.import = function(moduleName) {
      if (moduleName.startsWith('node:')) {
        const browserModule = nodeModules[moduleName];
        if (browserModule) {
          return originalImport(browserModule);
        }
        if (browserModule === null || browserModule === false) {
          // Return a mock Promise that resolves to an empty object
          return Promise.resolve({});
        }
      }
      return originalImport(moduleName);
    };
  }
  
  // Patch process.versions
  if (typeof process === 'undefined') {
    window.process = { 
      versions: { node: '16.0.0' },
      version: 'v16.0.0',
      env: {}
    };
  } else if (!process.versions) {
    process.versions = { node: '16.0.0' };
    process.version = 'v16.0.0';
  }
  
  console.log('[Node Modules Fix] Successfully applied all patches');
})(); 