"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log("AuthProvider: Component rendering");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      console.log("AuthProvider: Starting auth initialization");
      try {
        // Log Firebase config status
        console.log("AuthProvider: Checking Firebase config");
        const config = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        };
        console.log("AuthProvider: Config values present:", {
          apiKey: !!config.apiKey,
          authDomain: !!config.authDomain,
          projectId: !!config.projectId,
        });

        // Get Firebase Auth instance
        console.log("AuthProvider: Getting Firebase Auth instance");
        const auth = getFirebaseAuth();

        if (!auth) {
          throw new Error("Firebase Auth failed to initialize");
        }

        console.log("AuthProvider: Setting up auth state listener");
        unsubscribe = auth.onAuthStateChanged(
          (user) => {
            console.log(
              "AuthProvider: Auth state changed:",
              user ? `User ${user.uid} logged in` : "No user"
            );
            setUser(user);
            setLoading(false);
            setError(null);
          },
          (error) => {
            console.error("AuthProvider: Auth state error:", error);
            setError(error.message);
            setLoading(false);
          }
        );

        // Check current user immediately
        const currentUser = auth.currentUser;
        console.log(
          "AuthProvider: Current user check:",
          currentUser ? `User ${currentUser.uid} present` : "No current user"
        );
      } catch (error) {
        console.error("AuthProvider: Initialization error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to initialize authentication"
        );
        setLoading(false);
      }
    };

    console.log("AuthProvider: Starting initialization process");
    initializeAuth();

    return () => {
      console.log("AuthProvider: Cleanup running");
      if (unsubscribe) {
        console.log("AuthProvider: Unsubscribing from auth state");
        unsubscribe();
      }
    };
  }, []);

  console.log("AuthProvider: Rendering with state:", {
    hasUser: !!user,
    loading,
    hasError: !!error,
  });

  if (error) {
    console.error("AuthProvider Error:", error);
  }

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
