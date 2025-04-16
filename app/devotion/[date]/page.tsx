"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function DevotionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Background Layer */}
      <div className="fixed inset-0">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000"
            alt="Mountain Background"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", zIndex: -1 }}
          />
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black"
          style={{ zIndex: 0 }}
        />
      </div>

      {/* Content Layer */}
      <main
        className="relative min-h-screen flex flex-col p-6 text-white"
        style={{ zIndex: 1 }}
      >
        <div className="mt-auto space-y-6">
          <h2 className="text-4xl font-bold">Luke 23: 26-34</h2>
          <p className="text-xl leading-relaxed">
            As the soldiers led him away, they seized Simon from Cyrene, who was
            on his way in from the country, and put the cross on him and made
            him carry it behind Jesus. A large number of people followed him,
            including women who mourned and wailed for him. Jesus turned and
            said to them, "Daughters of Jerusalem, do not weep for me; weep for
            yourselves and for your children. For the time will come when you
            will say, 'Blessed are the childless women, the wombs that never
            bore and the breasts that never nursed!' Then they will say to the
            mountains, "Fall on us!"
          </p>

          <button
            onClick={() => router.push("/reflection")}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-full backdrop-blur-sm transition-all duration-300 flex items-center justify-center space-x-2 group mt-8"
          >
            <span>See Today's Reflection</span>
            <svg
              className="w-6 h-6 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
