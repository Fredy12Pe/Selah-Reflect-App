"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";

export default function HomePage() {
  const [userName, setUserName] = useState<string>("");
  const router = useRouter();
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "Friend");
      } else {
        router.push("/auth");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="relative h-screen">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
          alt="Mountain landscape"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white p-6">
          <div className="text-4xl font-bold mb-2">{formattedDate}</div>
          <h1 className="text-2xl mb-8">Have a blessed day, {userName}!</h1>
          <button
            onClick={() => router.push("/devotion")}
            className="bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:bg-gray-100 transition-colors"
          >
            Start Today's Devotion
          </button>
        </div>
      </div>
    </main>
  );
}
