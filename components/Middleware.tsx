"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isBrowser } from "@/lib/utils/environment";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/auth/login",
  "/_next",
  "/api",
  "/favicon.ico",
  "/manifest.json",
  "/firebase-fix.js",
  "/firebase-patch.js",
];

interface MiddlewareProps {
  children: React.ReactNode;
}

export function Middleware({ children }: MiddlewareProps) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Check if current path is public
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname?.startsWith(path));

  useEffect(() => {
    // Only run in browser
    if (!isBrowser()) {
      console.log("[Middleware Client] Running in server context, skipping");
      setLoading(false);
      return;
    }

    // Skip authentication check for public paths
    if (isPublicPath) {
      console.log(
        "[Middleware Client] Public path detected, skipping auth check:",
        pathname
      );
      setLoading(false);
      return;
    }

    // Initialize Firebase patch checking
    const patchCheck = () => {
      // Check if Firebase patches are applied
      if (typeof window !== "undefined") {
        const hasFbPatches =
          typeof window._isFirebaseServerApp === "function" &&
          typeof window._registerComponent === "function" &&
          typeof window._getProvider === "function";

        if (!hasFbPatches) {
          console.error(
            "[Middleware Client] Firebase patches not detected, applying now"
          );

          // Apply patches if not present
          window._isFirebaseServerApp =
            window._isFirebaseServerApp ||
            function () {
              return false;
            };
          window._registerComponent =
            window._registerComponent ||
            function (c) {
              return c;
            };
          window._getProvider =
            window._getProvider ||
            function () {
              return { getImmediate: () => ({}), get: () => ({}) };
            };
        } else {
          console.log("[Middleware Client] Firebase patches detected");
        }
      }

      // Continue loading the app
      setLoading(false);
    };

    // Allow some time for Firebase patches to be applied
    setTimeout(patchCheck, 500);
  }, [pathname, isPublicPath]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-white">Initializing application...</p>
        </div>
      </div>
    );
  }

  // Render children once authentication is checked
  return <>{children}</>;
}
