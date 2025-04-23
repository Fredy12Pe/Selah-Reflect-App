"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Inter } from "next/font/google";
import { useAuth } from "@/lib/context/AuthContext";
import { getFirebaseDb } from "@/lib/firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast, Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

interface DevotionData {
  date: string;
  title: string;
  scriptureReference: string;
  scriptureText: string;
  content: string;
  prayer: string;
  reflectionQuestions: string[];
}

interface ReflectionAnswer {
  questionId: number;
  answer: string;
  timestamp: number;
}

export default function ReflectionPage({
  params,
}: {
  params: { date: string };
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [devotion, setDevotion] = useState<DevotionData | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      console.log("No user found, redirecting to login");
      const currentPath = window.location.pathname;
      router.push(`/auth/login?from=${encodeURIComponent(currentPath)}`);
      return;
    }

    const fetchData = async () => {
      try {
        const db = getFirebaseDb();

        // Fetch devotion
        const devotionRef = doc(db, "devotions", params.date);
        const devotionSnap = await getDoc(devotionRef);

        if (devotionSnap.exists()) {
          const devotionData = devotionSnap.data() as DevotionData;
          setDevotion(devotionData);
          setAnswers(Array(devotionData.reflectionQuestions.length).fill(""));

          // Fetch user's previous answers if they exist
          if (user) {
            const answersRef = doc(
              db,
              `users/${user.uid}/reflections/${params.date}`
            );
            const answersSnap = await getDoc(answersRef);

            if (answersSnap.exists()) {
              const userAnswers = answersSnap.data()
                .answers as ReflectionAnswer[];
              const sortedAnswers = userAnswers
                .sort((a, b) => a.questionId - b.questionId)
                .map((a) => a.answer);
              setAnswers(sortedAnswers);
            }
          }
        } else {
          toast.error("Devotion not found");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load reflection");
      } finally {
        setPageLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [params.date, user, loading, router]);

  const handleAnswerChange = async (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);

    // Auto-save after 1 second of no typing
    if (user && devotion) {
      setSaving(true);
      try {
        const db = getFirebaseDb();
        const answersRef = doc(
          db,
          `users/${user.uid}/reflections/${params.date}`
        );

        const formattedAnswers: ReflectionAnswer[] = newAnswers.map(
          (answer, idx) => ({
            questionId: idx,
            answer,
            timestamp: Date.now(),
          })
        );

        await setDoc(
          answersRef,
          {
            date: params.date,
            answers: formattedAnswers,
            lastUpdated: Date.now(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error saving answer:", error);
        toast.error("Failed to save your answer");
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        <p className="text-white/80">Loading your reflection space...</p>
      </div>
    );
  }

  if (!user || !devotion) {
    return null;
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
            Today's Reflection
          </h1>

          {/* Questions */}
          <div className="space-y-8">
            {devotion.reflectionQuestions.map((question, index) => (
              <div key={index} className="space-y-4">
                <h2 className="text-xl font-semibold text-white">
                  Question {index + 1}
                </h2>
                <p className="text-white/90 text-lg leading-relaxed">
                  {question}
                </p>
                <div className="relative">
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
                  {saving && (
                    <div className="absolute right-2 top-2 text-white/50 text-sm">
                      Saving...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Prayer Section */}
          <div className="space-y-4 border-t border-white/20 pt-8">
            <h2 className="text-2xl font-bold text-white">Today's Prayer</h2>
            <p className="text-white/90 text-lg italic leading-relaxed">
              {devotion.prayer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
