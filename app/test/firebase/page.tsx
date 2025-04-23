"use client";

import { useEffect, useState } from "react";
import { checkFirebaseConfig } from "@/lib/firebase/checkConfig";
import { getApps, getApp, initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "@/lib/firebase/firebase";
import { useAuth } from "@/lib/context/AuthContext";

export default function FirebaseTestPage() {
  // Add auth state
  const { user, loading: authLoading, error: authError } = useAuth();

  const [configStatus, setConfigStatus] = useState<{
    hasIssues: boolean;
    issues: string[];
    isInitialized: boolean;
    config: any;
  } | null>(null);

  const [initStatus, setInitStatus] = useState({
    app: false,
    auth: false,
    firestore: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSignIn = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign in error:", error);
      setError(error instanceof Error ? error.message : "Failed to sign in");
    }
  };

  useEffect(() => {
    console.log("Starting Firebase test...");
    console.log("Auth state:", {
      user,
      loading: authLoading,
      error: authError,
    });
    console.log("Current Firebase config:", {
      ...firebaseConfig,
      apiKey: firebaseConfig.apiKey ? "***" : undefined,
      appId: firebaseConfig.appId ? "***" : undefined,
    });

    // Check configuration
    try {
      const status = checkFirebaseConfig();
      console.log("Config check result:", status);
      setConfigStatus(status);

      if (status.hasIssues) {
        setError("Firebase configuration has issues. Check the details below.");
        setLoading(false);
        return;
      }

      // Try to initialize Firebase if not already initialized
      if (!status.isInitialized) {
        console.log("Initializing Firebase...");
        const app = initializeApp(firebaseConfig);
        setInitStatus((prev) => ({ ...prev, app: true }));
        console.log("Firebase app initialized");

        // Try to initialize Auth
        try {
          console.log("Initializing Auth...");
          const auth = getAuth(app);
          setInitStatus((prev) => ({ ...prev, auth: true }));
          console.log("Auth initialized");
        } catch (e) {
          console.error("Auth initialization error:", e);
          setError(`Auth initialization failed: ${e.message}`);
        }

        // Try to initialize Firestore
        try {
          console.log("Initializing Firestore...");
          const db = getFirestore(app);
          setInitStatus((prev) => ({ ...prev, firestore: true }));
          console.log("Firestore initialized");
        } catch (e) {
          console.error("Firestore initialization error:", e);
          setError(`Firestore initialization failed: ${e.message}`);
        }
      } else {
        console.log("Firebase already initialized, checking services...");
        // Firebase is already initialized, just check services
        try {
          const app = getApp();
          setInitStatus((prev) => ({ ...prev, app: true }));
          console.log("Found existing Firebase app");

          const auth = getAuth(app);
          setInitStatus((prev) => ({ ...prev, auth: true }));
          console.log("Found existing Auth instance");

          const db = getFirestore(app);
          setInitStatus((prev) => ({ ...prev, firestore: true }));
          console.log("Found existing Firestore instance");
        } catch (e) {
          console.error("Service check error:", e);
          setError(`Service check failed: ${e.message}`);
        }
      }
    } catch (e) {
      console.error("Configuration check error:", e);
      setError(`Configuration check failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, authError]);

  if (loading || authLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Loading Firebase Test...</h1>
        <p className="text-gray-600">
          {loading
            ? "Checking Firebase configuration..."
            : "Waiting for authentication..."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Firebase Configuration Test</h1>

      {/* Auth Status */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p className="mb-2">
            Status:{" "}
            <span className={user ? "text-green-600" : "text-yellow-600"}>
              {user ? "Authenticated" : "Not Authenticated"}
            </span>
          </p>
          {user && (
            <div>
              <p>User ID: {user.uid}</p>
              <p>Email: {user.email}</p>
            </div>
          )}
          {!user && (
            <button
              onClick={handleSignIn}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Sign in with Google
            </button>
          )}
          {authError && <p className="text-red-600">Auth Error: {authError}</p>}
        </div>
      </section>

      {/* Configuration Status */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Configuration Check</h2>
        {configStatus ? (
          <div>
            <p
              className={`mb-2 ${
                configStatus.hasIssues ? "text-red-600" : "text-green-600"
              }`}
            >
              Status: {configStatus.hasIssues ? "Has Issues" : "OK"}
            </p>
            {configStatus.issues.length > 0 && (
              <ul className="list-disc pl-5 mb-4">
                {configStatus.issues.map((issue, index) => (
                  <li key={index} className="text-red-600">
                    {issue}
                  </li>
                ))}
              </ul>
            )}
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Configuration Values:</h3>
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(configStatus.config, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p>No configuration status available</p>
        )}
      </section>

      {/* Initialization Status */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Initialization Status</h2>
        <ul className="space-y-2">
          <li>
            Firebase App:
            <span
              className={
                initStatus.app ? "text-green-600 ml-2" : "text-red-600 ml-2"
              }
            >
              {initStatus.app ? "✓ Initialized" : "✗ Not Initialized"}
            </span>
          </li>
          <li>
            Authentication:
            <span
              className={
                initStatus.auth ? "text-green-600 ml-2" : "text-red-600 ml-2"
              }
            >
              {initStatus.auth ? "✓ Initialized" : "✗ Not Initialized"}
            </span>
          </li>
          <li>
            Firestore:
            <span
              className={
                initStatus.firestore
                  ? "text-green-600 ml-2"
                  : "text-red-600 ml-2"
              }
            >
              {initStatus.firestore ? "✓ Initialized" : "✗ Not Initialized"}
            </span>
          </li>
        </ul>
      </section>

      {/* Error Display */}
      {error && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Error</h2>
          <pre className="bg-red-50 p-4 rounded text-red-600 whitespace-pre-wrap break-all">
            {error}
          </pre>
        </section>
      )}
    </div>
  );
}
