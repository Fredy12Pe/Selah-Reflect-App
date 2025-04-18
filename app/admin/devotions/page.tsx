"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "@/app/context/AuthContext";
import { createOrUpdateDevotion } from "@/lib/services/devotionService";
import { DevotionInput } from "@/lib/types/devotion";

export default function DevotionsAdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [devotionData, setDevotionData] = useState<Omit<DevotionInput, "date">>(
    {
      title: "",
      scriptureReference: "",
      scriptureText: "",
      content: "",
      prayer: "",
      reflectionQuestions: [""],
    }
  );

  // List of admin emails that are allowed to access this page
  const ADMIN_EMAILS = ["fredypedro3@gmail.com"];

  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...devotionData.reflectionQuestions];
    newQuestions[index] = value;
    setDevotionData({ ...devotionData, reflectionQuestions: newQuestions });
  };

  const addQuestion = () => {
    setDevotionData({
      ...devotionData,
      reflectionQuestions: [...devotionData.reflectionQuestions, ""],
    });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = devotionData.reflectionQuestions.filter(
      (_, i: number) => i !== index
    );
    setDevotionData({ ...devotionData, reflectionQuestions: newQuestions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createOrUpdateDevotion({
        ...devotionData,
        date: selectedDate,
      });
      toast.success("Devotion saved successfully!");
      router.push(`/devotion/${selectedDate}`);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save devotion");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <Toaster position="top-center" />

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Manage Devotions</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-900 rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Devotion Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-black border border-zinc-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={devotionData.title}
                  onChange={(e) =>
                    setDevotionData({ ...devotionData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-black border border-zinc-700 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Scripture Reference
                </label>
                <input
                  type="text"
                  value={devotionData.scriptureReference}
                  onChange={(e) =>
                    setDevotionData({
                      ...devotionData,
                      scriptureReference: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-black border border-zinc-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Scripture Text
                </label>
                <textarea
                  value={devotionData.scriptureText}
                  onChange={(e) =>
                    setDevotionData({
                      ...devotionData,
                      scriptureText: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-black border border-zinc-700 text-white h-24"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Devotion Content
              </label>
              <textarea
                value={devotionData.content}
                onChange={(e) =>
                  setDevotionData({ ...devotionData, content: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-black border border-zinc-700 text-white h-32"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Prayer</label>
              <textarea
                value={devotionData.prayer}
                onChange={(e) =>
                  setDevotionData({ ...devotionData, prayer: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-black border border-zinc-700 text-white h-24"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Reflection Questions
              </label>
              <div className="space-y-3">
                {devotionData.reflectionQuestions.map(
                  (question: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) =>
                          handleQuestionChange(index, e.target.value)
                        }
                        className="flex-1 px-4 py-2 rounded-lg bg-black border border-zinc-700 text-white"
                        placeholder={`Question ${index + 1}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="px-3 py-2 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50"
                      >
                        Remove
                      </button>
                    </div>
                  )
                )}
                <button
                  type="button"
                  onClick={addQuestion}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Add Question
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-white text-black rounded-full py-4 px-6 font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Devotion"}
          </button>
        </form>
      </div>
    </main>
  );
}
