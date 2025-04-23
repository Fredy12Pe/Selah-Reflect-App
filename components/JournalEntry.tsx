"use client";

import React, { useState } from "react";
import { getFirebaseDb, getFirebaseAuth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

interface JournalEntryProps {
  date: string;
  prompt: string;
  onSave?: () => void;
}

export default function JournalEntry({
  date,
  prompt,
  onSave,
}: JournalEntryProps) {
  const [entry, setEntry] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const db = getFirebaseDb();
      const auth = getFirebaseAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not authenticated");
      }

      const docRef = doc(db, "journal_entries", `${user.uid}_${date}`);
      await setDoc(docRef, {
        userId: user.uid,
        date,
        prompt,
        entry,
        createdAt: new Date().toISOString(),
      });

      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error("Error saving journal entry:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">Journal Entry</h3>
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Write your reflections here..."
        className="input-field min-h-[200px] resize-y"
      />
      <div className="flex justify-between items-center">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Entry"}
        </button>
      </div>
    </div>
  );
}
