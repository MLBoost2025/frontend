"use client";

import { useState } from "react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Sidebar
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-4 top-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 bg-white/90 text-zinc-700 shadow-sm backdrop-blur hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200 dark:hover:bg-zinc-900"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        <Navbar
          title={title}
          subtitle={subtitle}
          onLogout={handleLogout}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="mt-16 min-h-[calc(100vh-4rem)] p-5 md:p-8">
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
            {headerSlot}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
