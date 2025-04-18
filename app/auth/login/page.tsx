"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/firebase";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const verifySession = async () => {
    const response = await fetch("/api/auth/verify", {
      credentials: "include",
    });
    return response.ok;
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Auth not initialized");

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Get the ID token
      const idToken = await result.user.getIdToken();
      console.log("Got ID token, creating session...");

      // Exchange the ID token for a session cookie
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create session");
      }

      console.log("Session created, verifying...");

      // Wait for the session to be verifiable
      let verified = false;
      for (let i = 0; i < 3; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        verified = await verifySession();
        if (verified) break;
      }

      if (!verified) {
        throw new Error("Failed to verify session");
      }

      console.log("Session verified, redirecting...");

      // Get the redirect path from URL params or default to today's devotion
      const from = searchParams.get("from");
      if (from) {
        router.push(from);
      } else {
        router.push("/devotion/2025-04-18");
      }
      router.refresh();
    } catch (error: any) {
      console.error("Sign in error:", error);
      setError(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-opacity-75 bg-[url('/images/background.jpg')] bg-cover bg-center">
      <div className="bg-black bg-opacity-50 p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">
          Welcome to Selah
        </h1>
        <div className="space-y-4">
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <img src="/google.svg" alt="Google" className="w-6 h-6" />
            <span>
              {loading ? "Setting up your session..." : "Sign in with Google"}
            </span>
          </button>
          {error && (
            <div className="text-red-500 text-center text-sm mt-2">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
