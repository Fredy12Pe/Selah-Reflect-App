"use client";

import React, { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

interface JournalEntryProps {
  date: string;
  verseReference: string;
  initialContent?: string;
}

export default function JournalEntry({
  date,
  verseReference,
  initialContent = "",
}: JournalEntryProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const handleSave = async () => {
    if (!auth.currentUser) return;

    setIsSaving(true);
    setSaveStatus("saving");

    try {
      const entryRef = doc(db, "users", auth.currentUser.uid, "journal", date);
      await setDoc(
        entryRef,
        {
          content,
          verseReference,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Error saving journal entry:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">Journal Entry</h3>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your reflections here..."
        className="input-field min-h-[200px] resize-y"
      />
      <div className="flex justify-between items-center">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Entry"}
        </button>
        {saveStatus === "saved" && (
          <span className="text-green-600">✓ Saved</span>
        )}
        {saveStatus === "error" && (
          <span className="text-red-600">Failed to save</span>
        )}
      </div>
    </div>
  );
}
