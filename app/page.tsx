"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { format } from "date-fns";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const today = format(new Date(), "yyyy-MM-dd");
      router.push(`/devotion/${today}`);
    }
  }, [loading, router]);

  return null;
}
