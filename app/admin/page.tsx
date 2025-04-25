"use client";

import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const ADMIN_EMAILS = ["fredypedro3@gmail.com"];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/devotions/new"
            className="block p-6 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Create New Devotion</h2>
            <p className="text-gray-400">
              Add a new daily devotion to the database
            </p>
          </Link>

          <Link
            href="/admin/devotions/manage"
            className="block p-6 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Manage Devotions</h2>
            <p className="text-gray-400">Edit or delete existing devotions</p>
          </Link>

          <Link
            href="/admin/generate-devotions"
            className="block p-6 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Generate Devotions</h2>
            <p className="text-gray-400">
              Auto-generate devotions for multiple dates
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="block p-6 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">User Management</h2>
            <p className="text-gray-400">View and manage user access</p>
          </Link>

          <Link
            href="/admin/settings"
            className="block p-6 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Settings</h2>
            <p className="text-gray-400">Configure application settings</p>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-zinc-900/50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Quick Stats</h2>
          <div className="text-sm text-gray-400">
            <p>Logged in as: {user.email}</p>
            <p>Role: Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
