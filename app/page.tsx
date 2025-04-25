"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import InstallPWA from "./components/InstallPWA";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    // Redirect to today's devotion
    router.replace(`/devotion/${formattedDate}`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      <InstallPWA />
    </div>
  );
}
