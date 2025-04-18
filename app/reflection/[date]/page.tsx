"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Inter } from "next/font/google";
import { useAuth } from "@/app/context/AuthContext";
import { toast, Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

// This would come from your backend in a real app
const reflection = {
  title: "Today's Reflection",
  questions: [
    "What does Jesus' response to the women tell us about His character and priorities, even in His moment of suffering?",
    "How does this passage challenge our perspective on what we should truly mourn for or be concerned about?",
    "In what ways might God be calling you to look beyond immediate circumstances to see deeper spiritual realities?",
  ],
  prayer:
    "Lord Jesus, help me to see beyond my immediate circumstances and understand Your heart for the world. Give me wisdom to discern what truly matters in light of eternity. Amen.",
};

export default function ReflectionPage({
  params,
}: {
  params: { date: string };
}) {
  const router = useRouter();
  const { user, loading, error } = useAuth();
  const [answers, setAnswers] = useState<string[]>(
    Array(reflection.questions.length).fill("")
  );

  useEffect(() => {
    if (error) {
      toast.error(`Authentication error: ${error}`);
    }
  }, [error]);

  useEffect(() => {
    if (!loading && !user) {
      console.log("No user found, redirecting to login");
      const currentPath = window.location.pathname;
      router.push(`/auth/login?from=${encodeURIComponent(currentPath)}`);
    }
  }, [loading, user, router]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    // Here you could add auto-save functionality to save to Firebase
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        <p className="text-white/80">Loading your reflection space...</p>
      </div>
    );
  }

  if (!user) {
    return null; // The useEffect will handle the redirect
  }

  return (
    <div className={`relative min-h-screen w-full isolate ${inter.className}`}>
      <Toaster position="top-center" />

      {/* Background Image Layer */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/background.jpg"
          alt="Mountain landscape"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/devotion/${params.date}`)}
          className="absolute top-6 left-6 text-white/80 hover:text-white
            transition-colors duration-200"
        >
          <svg
            className="w-8 h-8"
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
        </button>

        {/* Main Content */}
        <div className="px-6 py-20 max-w-2xl mx-auto space-y-12">
          <h1 className="text-4xl font-bold text-white text-center">
            {reflection.title}
          </h1>

          {/* Questions */}
          <div className="space-y-8">
            {reflection.questions.map((question, index) => (
              <div key={index} className="space-y-4">
                <h2 className="text-xl font-semibold text-white">
                  Question {index + 1}
                </h2>
                <p className="text-white/90 text-lg leading-relaxed">
                  {question}
                </p>
                <textarea
                  value={answers[index]}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="w-full p-4 rounded-xl bg-white/10 border border-white/20
                    text-white placeholder-white/50 resize-none
                    focus:outline-none focus:ring-2 focus:ring-white/30
                    transition-all duration-300"
                  rows={4}
                  placeholder="Write your reflection here..."
                />
              </div>
            ))}
          </div>

          {/* Prayer Section */}
          <div className="space-y-4 border-t border-white/20 pt-8">
            <h2 className="text-2xl font-bold text-white">Today's Prayer</h2>
            <p className="text-white/90 text-lg italic leading-relaxed">
              {reflection.prayer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
