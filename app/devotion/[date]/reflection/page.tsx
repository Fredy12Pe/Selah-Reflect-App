"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ReflectionPage({
  params,
}: {
  params: { date: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [question, setQuestion] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const displayName =
          user.displayName?.split(" ")[0] ||
          user.email?.split("@")[0] ||
          "Guest";
        setUserName(displayName);
        setLoading(false);
      } else {
        router.push("/auth/login");
      }
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
          className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70"
          style={{ zIndex: 0 }}
        />
      </div>

      {/* Content Layer */}
      <main className="relative min-h-screen p-8" style={{ zIndex: 1 }}>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <button
              onClick={() => router.push("/devotion")}
              className="text-white mb-6 flex items-center space-x-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back to Daily Devotion</span>
            </button>
            <h1 className="text-4xl font-bold text-white">
              Reflection for {format(new Date(params.date), "MMMM d, yyyy")}
            </h1>
          </div>

          {/* Scripture and Reflection */}
          <div className="bg-black/50 backdrop-blur-[90px] rounded-[20px] p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Luke 23: 26-34</h2>
            <p className="text-lg mb-8">
              As the soldiers led him away, they seized Simon from Cyrene...
            </p>

            <h3 className="text-xl font-bold mb-4">Reflection Questions</h3>
            <ul className="list-disc list-inside space-y-4 mb-8">
              <li>What does this passage reveal about Jesus's character?</li>
              <li>How can we apply Jesus's example in our own lives?</li>
              <li>What does this teach us about forgiveness?</li>
            </ul>
          </div>

          {/* Hymn of the Month */}
          <div className="bg-black/50 backdrop-blur-[90px] rounded-[20px] p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Hymn of the Month</h2>
            <h3 className="text-xl mb-2">Amazing Grace</h3>
            <p className="italic mb-4">by John Newton</p>
            <div className="space-y-2">
              <p>Amazing grace! How sweet the sound</p>
              <p>That saved a wretch like me!</p>
              <p>I once was lost, but now am found;</p>
              <p>Was blind, but now I see.</p>
            </div>
          </div>

          {/* AI Interaction */}
          <div className="bg-black/50 backdrop-blur-[90px] rounded-[20px] p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Ask for Guidance</h2>
            <div className="space-y-4">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about today's scripture..."
                className="w-full p-4 rounded-lg bg-white/10 text-white placeholder-gray-400 backdrop-blur-sm"
                rows={4}
              />
              <button className="bg-white text-black px-6 py-3 rounded-lg font-medium">
                Ask Question
              </button>
              {aiResponse && (
                <div className="mt-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                  {aiResponse}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
