"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const PUBLIC_PATHS = new Set(["/login"]);

function buildRedirectPath(pathname: string, query: string): string {
  if (!query) {
    return pathname;
  }
  return `${pathname}?${query}`;
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const isPublicPath = useMemo(() => PUBLIC_PATHS.has(pathname), [pathname]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated && !isPublicPath) {
      const query = typeof window === "undefined" ? "" : window.location.search.slice(1);
      const redirectTo = buildRedirectPath(pathname, query);
      router.replace(`/login?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }

    if (isAuthenticated && pathname === "/login") {
      const params =
        typeof window === "undefined"
          ? new URLSearchParams()
          : new URLSearchParams(window.location.search);
      const redirectTarget = params.get("redirect");
      if (redirectTarget && redirectTarget.startsWith("/")) {
        router.replace(redirectTarget);
      } else {
        router.replace("/problems");
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    isPublicPath,
    pathname,
    router,
  ]);

  if (!isPublicPath && (!isAuthenticated || isLoading)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f1117] text-sm text-zinc-300">
        Loading workspace...
      </main>
    );
  }

  return <>{children}</>;
}
