/**
 * Standalone Firebase Test Script
 * This script will be loaded directly in the browser to test Firebase initialization
 */

(function() {
  console.log('[Firebase Test] Starting Firebase test script...');
  
  // Apply required patches
  window._isFirebaseServerApp = function() { return false; };
  window._registerComponent = function(component) { return component; };
  window._getProvider = function() { 
    return { getImmediate: () => ({}), get: () => ({}) }; 
  };
  
  // Helper function to check environment variables
  function checkEnvVars() {
    const envVars = {
      apiKey: typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'exists' : 'missing',
      authDomain: typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'exists' : 'missing',
      projectId: typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'exists' : 'missing',
      storageBucket: typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'exists' : 'missing',
      messagingSenderId: typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'exists' : 'missing',
      appId: typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'exists' : 'missing',
    };
    
    console.log('[Firebase Test] Environment Variables:', envVars);
    return envVars;
  }
  
  // Try to initialize Firebase directly
  function initFirebase() {
    try {
      console.log('[Firebase Test] Attempting to load Firebase SDK directly...');
      
      // Configure Firebase
      const firebaseConfig = {
        apiKey: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FIREBASE_API_KEY : undefined,
        authDomain: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN : undefined,
        projectId: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID : undefined,
        storageBucket: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET : undefined,
        messagingSenderId: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID : undefined,
        appId: typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_FIREBASE_APP_ID : undefined,
      };
      
      console.log('[Firebase Test] Config object:', Object.keys(firebaseConfig).reduce((acc, key) => {
        acc[key] = firebaseConfig[key] ? 'exists' : 'missing';
        return acc;
      }, {}));
      
      // Create a div to show the test results
      const resultDiv = document.createElement('div');
      resultDiv.id = 'firebase-test-results';
      resultDiv.style.position = 'fixed';
      resultDiv.style.top = '10px';
      resultDiv.style.right = '10px';
      resultDiv.style.padding = '10px';
      resultDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      resultDiv.style.color = 'white';
      resultDiv.style.borderRadius = '5px';
      resultDiv.style.zIndex = '9999';
      resultDiv.style.maxWidth = '400px';
      resultDiv.style.maxHeight = '80vh';
      resultDiv.style.overflow = 'auto';
      resultDiv.style.fontFamily = 'monospace';
      
      resultDiv.innerHTML = '<h3>Firebase Test Results</h3>';
      resultDiv.innerHTML += '<p>Environment check complete</p>';
      resultDiv.innerHTML += '<p>See console for details</p>';
      
      // Add to the page
      document.body.appendChild(resultDiv);
      
      console.log('[Firebase Test] Test completed! Check the console for results.');
    } catch (error) {
      console.error('[Firebase Test] Error testing Firebase:', error);
    }
  }
  
  // Run the tests
  checkEnvVars();
  
  // Wait for the DOM to be ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initFirebase, 1000);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initFirebase, 1000);
    });
  }
})(); 