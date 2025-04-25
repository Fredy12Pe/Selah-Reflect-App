"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import InstallPWA from "./components/InstallPWA";
import Link from "next/link";
import Image from "next/image";
// import HeroImage from "/images/cover-image.jpg";
import Script from "next/script";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    // Redirect to today's devotion
    router.replace(`/devotion/${formattedDate}`);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12 bg-black">
      {/* Early Firebase patch script to fix initialization issues */}
      <Script id="firebase-patch" strategy="beforeInteractive">
        {`
          // Apply Firebase patches early
          if (typeof window !== 'undefined') {
            window._isFirebaseServerApp = function() { return false; };
            window._registerComponent = function(c) { return c; };
            window._getProvider = function() { return { getImmediate: () => ({}), get: () => ({}) }; };
            console.log('[Early Firebase Patch] Applied patches to window object');
          }
        `}
      </Script>

      <div className="w-full max-w-6xl mx-auto text-center relative">
        <div className="mb-8 relative w-full h-64 sm:h-72 md:h-96 lg:h-[36rem] overflow-hidden rounded-lg">
          {/* <Image
            src={HeroImage}
            alt="Selah - Daily Devotionals"
            fill
            priority
            className="object-cover"
          /> */}
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center px-4 md:px-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Selah
            </h1>
            <p className="text-xl md:text-2xl text-white mb-8">
              Daily devotionals to help you pause, reflect, and grow
            </p>
            <Link
              href="/devotion/2023-04-15"
              className="bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-opacity-90 transition duration-300"
            >
              Start Today's Devotional
            </Link>
          </div>
        </div>

        <InstallPWA />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Daily Scripture</h2>
            <p className="text-gray-600">
              Meditate on carefully selected passages from God's Word.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Guided Reflection</h2>
            <p className="text-gray-600">
              Thoughtful prompts to help you apply Scripture to your daily life.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Prayer Journal</h2>
            <p className="text-gray-600">
              Record your prayers and track how God works in your life.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
