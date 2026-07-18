"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import Landing from "./components/Landing";
import { useAuth } from "@/context/AuthContext";

const DashboardHome = dynamic(() => import("./components/DashboardHome"), {
  loading: () => (
    <div role="status" aria-label="Loading your dashboard" className="flex min-h-screen items-center justify-center text-zinc-400">
      <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
    </div>
  ),
});

// The root route is public: logged-out visitors see the marketing landing,
// authenticated users get their dashboard.
export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  // The session check is deliberately non-blocking for the public route.
  // Visitors see useful cached HTML immediately even if the free API is asleep.
  return isLoading || !isAuthenticated ? <Landing /> : <DashboardHome />;
}
