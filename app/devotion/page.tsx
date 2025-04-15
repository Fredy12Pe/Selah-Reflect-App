"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { auth } from "@/lib/firebase";
import { getVerse, getTodaysVerse } from "@/lib/bibleApi";
import { getResources } from "@/lib/gemini";
import DevotionHeader from "@/components/DevotionHeader";
import JournalEntry from "@/components/JournalEntry";
import ReflectWithAI from "@/components/ReflectWithAI";
import ResourceCard from "@/components/ResourceCard";

interface Resource {
  title: string;
  type: "video" | "podcast" | "article";
  url: string;
  description?: string;
}

export default function Devotion() {
  const router = useRouter();
  const [verse, setVerse] = useState({ reference: "", text: "" });
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const checkAuth = () => {
      if (!auth.currentUser) {
        router.push("/auth");
      }
    };

    const loadDevotionContent = async () => {
      try {
        // Get today's verse
        const reference = getTodaysVerse();
        const verseData = await getVerse(reference);
        setVerse(verseData);

        // Get AI-generated resources
        const resourcesText = await getResources(reference);
        // Parse the resources text into structured data
        // This is a simplified example - you'll need to parse the AI response properly
        const parsedResources = [
          {
            title: "Understanding the Context",
            type: "video" as const,
            url: "https://youtube.com/example",
            description: "A detailed explanation of the historical context",
          },
          // Add more resources as needed
        ];
        setResources(parsedResources);
      } catch (error) {
        console.error("Error loading devotion content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    loadDevotionContent();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading today's devotion...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DevotionHeader reference={verse.reference} />

      <main className="p-6 space-y-8">
        {/* Scripture Text */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Scripture</h2>
          <p className="text-lg text-gray-700 leading-relaxed">{verse.text}</p>
        </div>

        {/* Reflection Questions */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Reflection Questions
          </h2>
          <ul className="space-y-4">
            <li className="text-gray-700">
              What does this verse teach us about God's love?
            </li>
            <li className="text-gray-700">
              How can you respond to this verse in your life?
            </li>
          </ul>
        </div>

        {/* Journal Entry */}
        <div className="card">
          <JournalEntry date={today} verseReference={verse.reference} />
        </div>

        {/* AI Reflection */}
        <div className="card">
          <ReflectWithAI
            verse={verse.text}
            onSaveReflection={(reflection) => {
              // Handle saving AI reflection to journal
              console.log("Saving reflection:", reflection);
            }}
          />
        </div>

        {/* Resources */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Related Resources
          </h2>
          <div className="grid gap-4">
            {resources.map((resource, index) => (
              <ResourceCard key={index} {...resource} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
