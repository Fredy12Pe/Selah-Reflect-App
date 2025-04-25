"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { format, addYears, subYears } from "date-fns";

export default function GenerateDevotionsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const ADMIN_EMAILS = ["fredypedro3@gmail.com"];

  const [startDate, setStartDate] = useState(() => {
    // Default to one year ago
    const date = subYears(new Date(), 1);
    return format(date, "yyyy-MM-dd");
  });

  const [endDate, setEndDate] = useState(() => {
    // Default to one year from now
    const date = addYears(new Date(), 1);
    return format(date, "yyyy-MM-dd");
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<null | {
    success: boolean;
    message: string;
    count?: number;
  }>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated and is an admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || "");

  // Function to generate devotions
  const generateDevotions = async () => {
    setIsGenerating(true);
    setResult(null);
    setError(null);

    try {
      // First, generate the devotions
      const response = await fetch("/api/admin/generate-devotions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate devotions");
      }

      setResult({
        success: true,
        message: data.message,
        count: data.count,
      });
    } catch (error: any) {
      console.error("Error generating devotions:", error);
      setError(error.message || "An unknown error occurred");
      setResult({
        success: false,
        message: error.message || "Failed to generate devotions",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">You do not have permission to access this page.</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Generate Devotions</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <p className="mb-4 text-gray-600">
          This utility will generate devotion content for a range of dates and
          store them in the database. Use this to pre-populate content for
          future dates or backfill past dates.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={generateDevotions}
            disabled={isGenerating}
            className={`px-6 py-2 rounded-md text-white ${
              isGenerating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Generating...</span>
              </div>
            ) : (
              "Generate Devotions"
            )}
          </button>
        </div>
      </div>

      {result && (
        <div
          className={`rounded-lg p-6 ${
            result.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-2 ${
              result.success ? "text-green-700" : "text-red-700"
            }`}
          >
            {result.success ? "Success!" : "Error"}
          </h2>
          <p className={result.success ? "text-green-600" : "text-red-600"}>
            {result.message}
            {result.count && ` (${result.count} devotions generated)`}
          </p>
        </div>
      )}
    </div>
  );
}
