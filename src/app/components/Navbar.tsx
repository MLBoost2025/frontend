"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import ThemeSwitcher from "./ThemeSwitcher";

interface NavbarProps {
  title?: string;
  subtitle?: string;
  onLogout?: () => void;
  isSidebarOpen?: boolean;
}

export default function Navbar({
  title,
  subtitle,
  onLogout,
  isSidebarOpen = true,
}: NavbarProps) {
  const { user, logout } = useAuth();
  const avatarInitial = useMemo(
    () => user?.name?.trim().charAt(0).toUpperCase() || "U",
    [user]
  );

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    await logout();
  };

  return (
    <nav
      className={`fixed top-0 right-0 z-10 flex h-16 items-center justify-between border-b border-zinc-200/80 bg-white/90 px-5 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/90 ${
        isSidebarOpen ? "left-60" : "left-0"
      }`}
    >
      <div className="min-w-0">
        {title ? (
          <h1 className="truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-base">
            {title}
          </h1>
        ) : null}
        {subtitle ? (
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <ThemeSwitcher />

        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
          {avatarInitial}
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
