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
import { format, addDays, subDays } from "date-fns";
import { Outfit } from "next/font/google";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import ScriptureModal from "@/app/components/modals/ScriptureModal";
import JournalModal from "@/app/components/modals/JournalModal";
import ResourcesModal from "@/app/components/modals/ResourcesModal";
import { parsePDF, DevotionContent } from "@/lib/pdfUtils";
import { toast } from "react-hot-toast";

const outfit = Outfit({ subsets: ["latin"] });

// Hymn data - this could be moved to a separate file or database later
const hymn = {
  title: "When I survey the Wondrous Cross",
  image:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000",
};

export default function ReflectionPage({
  params,
}: {
  params: { date: string };
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [scriptureModalOpen, setScriptureModalOpen] = useState(false);
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [resourcesModalOpen, setResourcesModalOpen] = useState(false);
  const [devotionContent, setDevotionContent] =
    useState<DevotionContent | null>(null);
  const [loading, setLoading] = useState(true);

  const date = new Date(params.date);
  const formattedDate = format(date, "EEEE, MMMM d");

  useEffect(() => {
    async function loadDevotionContent() {
      try {
        const content = await parsePDF(params.date);
        setDevotionContent(content);
      } catch (error) {
        console.error("Error loading devotion:", error);
        toast.error("Failed to load devotion content");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDevotionContent();
    }
  }, [user, params.date]);

  const handleDateChange = (newDate: Date) => {
    const formattedNewDate = format(newDate, "yyyy-MM-dd");
    router.push(`/devotion/${formattedNewDate}/reflection`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/80">Loading your reflection...</p>
        </div>
      </div>
    );
  }

  return (
    <main
      className={`${outfit.className} min-h-screen bg-black text-white pb-8`}
    >
      {/* Date Navigation */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            className="p-2 rounded-full bg-black/40"
            onClick={() => handleDateChange(subDays(date, 1))}
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button className="px-6 py-2 rounded-full bg-zinc-800/80">
            {formattedDate}
          </button>
          <button
            className="p-2 rounded-full bg-black/40"
            onClick={() => handleDateChange(addDays(date, 1))}
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Hymn of the Month */}
        <div className="mt-4 rounded-3xl overflow-hidden relative aspect-[2/1]">
          <img
            src={hymn.image}
            alt="Landscape"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 p-6 flex flex-col justify-center">
            <p className="text-sm font-medium text-white/80">
              Hymn of the Month:
            </p>
            <h2 className="text-2xl font-medium mt-1">{hymn.title}</h2>
          </div>
        </div>

        {/* Scripture Section */}
        <section>
          <h2 className="text-lg mb-3">Today's Scripture</h2>
          <button
            className="w-full bg-zinc-900/80 rounded-2xl py-4 px-6"
            onClick={() => setScriptureModalOpen(true)}
          >
            <span className="text-xl">
              {devotionContent?.title || "Loading..."}
            </span>
          </button>
        </section>

        {/* Reflection Questions */}
        <section>
          <h2 className="text-lg mb-3">Reflection Questions</h2>
          <div className="bg-zinc-900/80 rounded-2xl p-6 space-y-6">
            <div className="space-y-4">
              {devotionContent?.questions.map((question, index) => (
                <div key={index} className="flex gap-4">
                  <span className="text-lg">{index + 1}.</span>
                  <p className="text-lg flex-1">{question}</p>
                </div>
              ))}
            </div>
            <button
              className="w-full bg-white text-black rounded-full py-4 px-6 font-medium flex items-center justify-center gap-2"
              onClick={() => setJournalModalOpen(true)}
            >
              <span>Journal Entry</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* AI Chat */}
        <section>
          <h2 className="text-lg mb-3">Reflect with AI</h2>
          <div className="bg-zinc-900/80 rounded-2xl p-4 flex items-center gap-3">
            <input
              type="text"
              placeholder="Ask questions about today's text..."
              className="flex-1 bg-transparent text-white/60 outline-none"
            />
            <button className="p-2 rounded-xl bg-zinc-800">
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Resources */}
        <section>
          <button
            className="w-full bg-zinc-900/80 rounded-2xl p-6 text-left"
            onClick={() => setResourcesModalOpen(true)}
          >
            <div className="relative aspect-[2/1] rounded-xl overflow-hidden mb-4">
              <img
                src="/bible-study.jpg"
                alt="Bible study resources"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-medium mb-1">
              Resources for today's text
            </h2>
            <p className="text-white/60">
              Bible Commentaries, Videos, and Podcasts
            </p>
          </button>
        </section>
      </div>

      {/* Modals */}
      <ScriptureModal
        isOpen={scriptureModalOpen}
        onClose={() => setScriptureModalOpen(false)}
        reference={devotionContent?.title || ""}
      />
      <JournalModal
        isOpen={journalModalOpen}
        onClose={() => setJournalModalOpen(false)}
        date={params.date}
        questions={devotionContent?.questions || []}
      />
      <ResourcesModal
        isOpen={resourcesModalOpen}
        onClose={() => setResourcesModalOpen(false)}
        reference={devotionContent?.title || ""}
      />
    </main>
  );
}
