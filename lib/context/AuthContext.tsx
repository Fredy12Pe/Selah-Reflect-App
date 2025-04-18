"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/firebase";
import { useRouter, usePathname } from "next/navigation";

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

const setSessionCookie = async (token: string) => {
  try {
    // Set session cookie with strict security settings
    const cookieValue = `__session=${token}; path=/; max-age=3600; SameSite=Strict; Secure`;
    document.cookie = cookieValue;
    console.log("AuthProvider - Setting session cookie");
  } catch (error) {
    console.error("AuthProvider - Error setting session cookie:", error);
    throw error;
  }
};

const clearSessionCookie = () => {
  try {
    document.cookie = `__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure`;
    console.log("AuthProvider - Session cookie cleared");
  } catch (error) {
    console.error("AuthProvider - Error clearing session cookie:", error);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("AuthProvider - Starting initialization");
    if (typeof window === "undefined") {
      console.log("AuthProvider - Server-side rendering, skipping");
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let tokenRefreshInterval: NodeJS.Timeout | undefined;

    const initializeAuth = async () => {
      try {
        console.log("AuthProvider - Getting auth instance");
        const auth = getFirebaseAuth();
        if (!auth) {
          console.error("AuthProvider - Auth not initialized");
          setError("Authentication not initialized");
          setLoading(false);
          if (!pathname?.startsWith("/auth")) {
            router.replace("/auth/login");
          }
          return;
        }

        console.log("AuthProvider - Setting up auth state listener");
        unsubscribe = auth.onAuthStateChanged(async (user) => {
          console.log(
            "AuthProvider - Auth state changed:",
            user ? "User present" : "No user"
          );
          if (user) {
            try {
              // Get a fresh ID token
              const token = await user.getIdToken(true);
              console.log("AuthProvider - Got fresh ID token");
              await setSessionCookie(token);
              setUser(user);

              // Set up token refresh interval (every 30 minutes)
              if (tokenRefreshInterval) {
                clearInterval(tokenRefreshInterval);
              }
              tokenRefreshInterval = setInterval(async () => {
                try {
                  const newToken = await user.getIdToken(true);
                  await setSessionCookie(newToken);
                  console.log("AuthProvider - Token refreshed");
                } catch (error) {
                  console.error("AuthProvider - Token refresh error:", error);
                }
              }, 30 * 60 * 1000); // 30 minutes
            } catch (error) {
              console.error("AuthProvider - Error getting fresh token:", error);
              clearSessionCookie();
              setUser(null);
              if (!pathname?.startsWith("/auth")) {
                router.replace("/auth/login");
              }
            }
          } else {
            console.log("AuthProvider - No user, clearing session");
            if (tokenRefreshInterval) {
              clearInterval(tokenRefreshInterval);
            }
            clearSessionCookie();
            setUser(null);
            if (pathname && !pathname.startsWith("/auth")) {
              router.replace("/auth/login");
            }
          }
          setLoading(false);
          setError(null);
        });
      } catch (error: any) {
        console.error("AuthProvider - Auth initialization error:", error);
        clearSessionCookie();
        setError(error.message);
        setLoading(false);
        setUser(null);
        if (!pathname?.startsWith("/auth")) {
          router.replace("/auth/login");
        }
      }
    };

    // Initialize auth immediately
    initializeAuth();

    return () => {
      console.log("AuthProvider - Cleaning up");
      if (unsubscribe) {
        unsubscribe();
      }
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
    };
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
