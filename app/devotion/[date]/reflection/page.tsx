"use client";

/**
 * Daily Reflection Page
 *
 * This page provides an interactive reflection experience:
 * - Recap of today's scripture
 * - Guided reflection questions
 * - Hymn of the month
 * - AI-powered reflection assistant
 *
 * Route: /devotion/[date]/reflection
 * Example: /devotion/2024-03-19/reflection
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  addDays,
  subDays,
  isFuture,
  isToday,
  parseISO,
} from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { getDevotionByDate } from "@/lib/services/devotionService";
import { Devotion } from "@/lib/types/devotion";
import { toast } from "react-hot-toast";

// Unsplash API access key
const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

export default function ReflectionPage({
  params,
}: {
  params: { date: string };
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [devotionData, setDevotionData] = useState<Devotion | null>(null);
  const currentDate = parseISO(params.date);
  const today = new Date();

  // Image states
  const [hymnImage, setHymnImage] = useState("/hymn-bg.jpg");
  const [resourcesImage, setResourcesImage] = useState("/resources-bg.jpg");

  // AI reflection states
  const [question, setQuestion] = useState("");
  const [aiReflection, setAiReflection] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Hymn modal state
  const [showHymnModal, setShowHymnModal] = useState(false);

  // Create a date-based parameter to change images daily
  const getDateBasedParam = (date: string, salt: string = "") => {
    const dateHash = date
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `${dateHash}${salt}`;
  };

  // Get unique parameters based on current date
  const hymnParam = getDateBasedParam(params.date, "hymn");
  const resourceParam = getDateBasedParam(params.date, "resource");

  // Lyrics for "When I Survey the Wondrous Cross"
  const hymnLyrics = [
    {
      verse: 1,
      lines: [
        "When I survey the wondrous cross",
        "On which the Prince of glory died,",
        "My richest gain I count but loss,",
        "And pour contempt on all my pride.",
      ],
    },
    {
      verse: 2,
      lines: [
        "Forbid it, Lord, that I should boast,",
        "Save in the death of Christ my God!",
        "All the vain things that charm me most,",
        "I sacrifice them to His blood.",
      ],
    },
    {
      verse: 3,
      lines: [
        "See from His head, His hands, His feet,",
        "Sorrow and love flow mingled down!",
        "Did e'er such love and sorrow meet,",
        "Or thorns compose so rich a crown?",
      ],
    },
    {
      verse: 4,
      lines: [
        "Were the whole realm of nature mine,",
        "That were a present far too small;",
        "Love so amazing, so divine,",
        "Demands my soul, my life, my all.",
      ],
    },
  ];

  // Function to check if a devotion exists and load it
  const checkAndLoadDevotion = async (date: string) => {
    if (!user) return false;
    setIsLoading(true);
    try {
      const devotion = await getDevotionByDate(date);
      console.log("Loaded devotion data:", devotion);
      if (devotion) {
        setDevotionData(devotion);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking devotion:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load devotion data on mount and when date changes
  useEffect(() => {
    console.log("Loading devotion for date:", params.date);
    checkAndLoadDevotion(params.date);
  }, [params.date, user]);

  // Function to handle navigation
  const handleDateChange = async (newDate: Date) => {
    // Prevent navigation to future dates
    if (isFuture(newDate)) {
      toast.error("Cannot view future devotions");
      return;
    }

    setIsLoading(true);
    const formattedDate = format(newDate, "yyyy-MM-dd");

    // Check if devotion exists for the new date
    const exists = await checkAndLoadDevotion(formattedDate);
    if (!exists) {
      toast.error("No devotion available for this date");
      setIsLoading(false);
      return;
    }

    // Navigate to the new date
    router.push(`/devotion/${formattedDate}/reflection`);
  };

  // Disable next button if current date is today
  const isNextDisabled = isToday(currentDate) || isFuture(currentDate);

  // Get the first two questions from all sections
  const getFirstTwoQuestions = () => {
    if (!devotionData?.reflectionSections?.length) {
      console.log("No reflection sections found");
      return [];
    }

    const firstSection = devotionData.reflectionSections[0];
    console.log("First reflection section:", firstSection);
    return firstSection.questions.slice(0, 2);
  };

  // Get the current questions
  const currentQuestions = getFirstTwoQuestions();
  console.log("Current questions:", currentQuestions);

  // Function to handle AI reflection generation
  const handleReflectionGeneration = async () => {
    if (!question.trim() || !devotionData?.bibleText) return;

    setIsAiLoading(true);
    setAiError("");

    try {
      const response = await fetch("/api/reflection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verse: devotionData.bibleText,
          question: question.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate reflection");
      }

      setAiReflection(data.reflection);
    } catch (error) {
      console.error("Error generating AI reflection:", error);
      setAiError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  // Handle key press in reflection input
  const handleReflectionKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleReflectionGeneration();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Please sign in to view devotions</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Date Navigation */}
      <div className="relative flex items-center justify-center py-4">
        <button
          onClick={() => handleDateChange(subDays(currentDate, 1))}
          disabled={isLoading}
          className="absolute left-4 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800/50
            hover:bg-zinc-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        <button
          onClick={() => setShowCalendar(true)}
          className="px-8 py-2 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 transition-all flex items-center gap-2"
        >
          <span className="text-lg">{format(currentDate, "EEEE, MMMM d")}</span>
          <CalendarIcon className="w-5 h-5" />
        </button>

        {showCalendar && (
          <div className="absolute top-full mt-2 z-50">
            <DatePicker
              selected={currentDate}
              onChange={(date: Date | null) => {
                setShowCalendar(false);
                if (date) handleDateChange(date);
              }}
              maxDate={new Date()}
              inline
              calendarClassName="bg-zinc-800 border-zinc-700 text-white"
              dayClassName={(_date: Date) => "hover:bg-zinc-700 rounded-full"}
            />
          </div>
        )}

        <button
          onClick={() => handleDateChange(addDays(currentDate, 1))}
          disabled={isNextDisabled || isLoading}
          className="absolute right-4 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800/50
            hover:bg-zinc-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="px-4 py-6 space-y-6">
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            {/* Hymn of the Month */}
            <div
              className="relative overflow-hidden rounded-3xl aspect-[2/1] bg-navy-900 cursor-pointer"
              onClick={() => setShowHymnModal(true)}
            >
              <img
                src={`https://images.unsplash.com/photo-1445543949571-ffc3e0e2f55e?w=1200&v=${hymnParam}`}
                alt="Hymn background"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 to-black/80" />
              <div className="relative p-6 flex flex-col justify-end h-full">
                <p className="text-lg font-medium mb-2">Hymn of the Month:</p>
                <h2 className="text-3xl font-medium">
                  When I survey the Wondrous Cross
                </h2>
              </div>
            </div>

            {/* Today's Scripture */}
            <div>
              <h3 className="text-xl mb-3">Today's Scripture</h3>
              <div className="p-6 rounded-2xl bg-zinc-900/80">
                <p className="text-2xl font-medium">
                  {devotionData?.bibleText || "No scripture available"}
                </p>
              </div>
            </div>

            {/* Reflection Questions */}
            <div>
              <h3 className="text-xl mb-3">Reflection Questions</h3>
              <div className="p-6 rounded-2xl bg-zinc-900/80 space-y-8">
                <div className="space-y-6">
                  {currentQuestions.length > 0 ? (
                    currentQuestions.map((question, index) => (
                      <div key={index}>
                        <p className="text-lg">
                          {index + 1}. {question}
                        </p>
                      </div>
                    ))
                  ) : (
                    <>
                      <div>
                        <p className="text-lg">1.</p>
                      </div>
                      <div>
                        <p className="text-lg">2.</p>
                      </div>
                    </>
                  )}
                </div>
                <Link
                  href={`/devotion/${params.date}/journal`}
                  className="inline-flex items-center px-6 py-3 bg-white text-black rounded-full font-medium"
                >
                  Journal Entry
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>

            {/* Reflect with AI */}
            <div>
              <h3 className="text-xl mb-3">Reflect with AI</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Ask questions about today's text..."
                  className="flex-1 px-6 py-4 rounded-2xl bg-zinc-900/80 text-white placeholder-gray-400"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleReflectionKeyPress}
                  disabled={isAiLoading}
                />
                <button
                  className="p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-700/80 transition-all disabled:opacity-50"
                  onClick={handleReflectionGeneration}
                  disabled={
                    isAiLoading || !question.trim() || !devotionData?.bibleText
                  }
                >
                  {isAiLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRightIcon className="w-6 h-6" />
                  )}
                </button>
              </div>

              {aiError && (
                <div className="text-red-400 mb-4 px-4 py-2 bg-red-900/30 rounded-lg">
                  {aiError}
                </div>
              )}

              {aiReflection && (
                <div className="p-6 rounded-2xl bg-zinc-900/80 mb-6">
                  <p className="text-lg whitespace-pre-wrap">{aiReflection}</p>
                </div>
              )}
            </div>

            {/* Resources */}
            <Link href="#" className="block">
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{ height: "150px" }}
              >
                <img
                  src={`https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200&v=${resourceParam}`}
                  alt="Bible study resources"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-900/70 to-black/80" />
                <div className="relative p-6">
                  <h3 className="text-2xl font-semibold mb-2">
                    Resources for today's text
                  </h3>
                  <p className="text-gray-300">
                    Bible Commentaries, Videos, and Podcasts
                  </p>
                </div>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Hymn Lyrics Modal */}
      {showHymnModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 animate-fadein">
          <div className="w-full max-w-lg bg-zinc-900 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto animate-slidein">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                When I Survey the Wondrous Cross
              </h2>
              <button
                onClick={() => setShowHymnModal(false)}
                className="p-2 text-white hover:text-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-gray-400 italic">By Isaac Watts, 1707</p>

              {hymnLyrics.map((verse) => (
                <div key={verse.verse} className="space-y-1.5">
                  <p className="text-gray-400 font-medium">
                    Verse {verse.verse}
                  </p>
                  {verse.lines.map((line, i) => (
                    <p key={i} className="text-white">
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-zinc-700 pt-4">
              <p className="text-gray-400 text-sm">
                This hymn reminds us of Christ's sacrifice and calls us to
                respond with total dedication. It's one of the most powerful and
                beloved hymns in Christian worship.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
