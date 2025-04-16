"use client";

import { useState, useEffect } from "react";
import { getVerse, TRANSLATIONS } from "@/lib/services/bible";

interface BibleVerseDisplayProps {
  reference?: string;
  translation?: keyof typeof TRANSLATIONS;
}

export default function BibleVerseDisplay({
  reference = "John 3:16",
  translation = "ESV",
}: BibleVerseDisplayProps) {
  const [verse, setVerse] = useState<{
    reference: string;
    text: string;
    translation: string;
  } | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVerse() {
      try {
        setLoading(true);
        const verseData = await getVerse(reference, TRANSLATIONS[translation]);
        setVerse(verseData);
        setError("");
      } catch (err) {
        setError("Failed to load verse. Please try again later.");
        console.error("Error fetching verse:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchVerse();
  }, [reference, translation]);

  if (loading) {
    return (
      <div className="animate-pulse p-4 bg-gray-100 rounded-lg">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;
  }

  if (!verse) {
    return null;
  }

  // Remove HTML tags from the verse text
  const cleanText = verse.text.replace(/<\/?[^>]+(>|$)/g, "");

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <p className="text-lg font-serif mb-2">{cleanText}</p>
      <p className="text-sm text-gray-600">
        {verse.reference} ({translation})
      </p>
    </div>
  );
}
