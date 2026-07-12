"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "@/context/AuthContext";

interface MainLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerSlot?: React.ReactNode;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export default function MainLayout({
  title,
  subtitle,
  children,
  headerSlot,
  selectedCategory,
  onCategoryChange,
}: MainLayoutProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const desktopMedia = window.matchMedia("(min-width: 1024px)");
    const syncSidebar = () => setIsSidebarOpen(desktopMedia.matches);

    syncSidebar();
    desktopMedia.addEventListener("change", syncSidebar);
    return () => desktopMedia.removeEventListener("change", syncSidebar);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen text-zinc-900 dark:text-zinc-100">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-50 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
      >
        Skip to main content
      </a>
      <Sidebar
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-4 top-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/80 bg-white/80 text-zinc-700 shadow-sm backdrop-blur-xl hover:bg-white dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-200 dark:hover:bg-white/10"
          aria-label="Open sidebar"
          aria-controls="primary-sidebar"
          aria-expanded={isSidebarOpen}
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-60" : "ml-0"
        }`}
      >
        <Navbar
          title={title}
          subtitle={subtitle}
          onLogout={handleLogout}
          isSidebarOpen={isSidebarOpen}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="mt-16 min-h-[calc(100vh-4rem)] p-5 outline-none md:p-8"
        >
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
            {headerSlot}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
