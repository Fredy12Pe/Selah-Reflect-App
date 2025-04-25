import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the app directory homepage
    router.replace("/");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Loading Selah...</h1>
        <p className="mt-2">Please wait while we redirect you to the app</p>
      </div>
    </div>
  );
}
