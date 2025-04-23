"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { getDevotionByDate } from "@/lib/services/devotionService";
import { Devotion, ReflectionQuestion } from "@/lib/types/devotion";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

interface DevotionPageClientProps {
  date: string;
}

export default function DevotionPageClient({ date }: DevotionPageClientProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [devotion, setDevotion] = useState<Devotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    async function loadDevotion() {
      try {
        setLoading(true);
        setError(null);
        console.log("Loading devotion for date:", date);
        const devotionData = await getDevotionByDate(date);
        console.log("Devotion data:", devotionData);
        if (!devotionData) {
          setError("No devotion found for this date");
          return;
        }
        setDevotion(devotionData);
      } catch (err: any) {
        console.error("Error loading devotion:", err);
        if (err.message.includes("permission")) {
          setError("Please sign in again to access devotions");
          // Clear auth state and redirect to login
          router.push("/auth/login");
        } else {
          setError(err.message || "Failed to load devotion");
        }
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDevotion();
    }
  }, [date, user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div
        className="min-h-screen bg-cover bg-center relative"
        style={{ backgroundImage: "url(/images/background.jpg)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-cover bg-center relative"
        style={{ backgroundImage: "url(/images/background.jpg)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white">
          <p className="text-xl mb-4">{error}</p>
          {error.includes("sign in") ? (
            <button
              onClick={() => router.push("/auth/login")}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!devotion) {
    return (
      <div
        className="min-h-screen bg-cover bg-center relative"
        style={{ backgroundImage: "url(/images/background.jpg)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white">
          <p className="text-xl">No devotion found for this date</p>
        </div>
      </div>
    );
  }

  if (devotion.type === "commentary") {
    return (
      <div
        className="min-h-screen bg-cover bg-center relative"
        style={{ backgroundImage: "url(/images/background.jpg)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="relative z-10 container mx-auto px-4 py-12 text-white">
          <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold">{devotion.title}</h1>
            {devotion.content && (
              <div className="prose prose-lg prose-invert">
                <div dangerouslySetInnerHTML={{ __html: devotion.content }} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url(/images/background.jpg)" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
      <div className="relative z-10 container mx-auto px-4 py-32 text-white">
        <div className="max-w-3xl mx-auto space-y-16">
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold">
              {devotion.bibleText || devotion.scriptureReference}
            </h2>
          </div>

          {devotion.content && (
            <div className="prose prose-lg prose-invert">
              <div dangerouslySetInnerHTML={{ __html: devotion.content }} />
            </div>
          )}

          {devotion.reflectionQuestions &&
            devotion.reflectionQuestions.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Reflection Questions</h2>
                <ul className="space-y-4">
                  {devotion.reflectionQuestions.map(
                    (q: ReflectionQuestion, index) => (
                      <li key={index} className="bg-black/20 p-6 rounded-lg">
                        {q.reference && (
                          <p className="text-sm text-white/70 mb-2">
                            {q.reference}
                          </p>
                        )}
                        <p className="text-lg">{q.question}</p>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          <Link
            href={`/reflection/${date}`}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-black/40 rounded-lg hover:bg-black/60 transition-colors"
          >
            <span>See Today's Reflection</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
