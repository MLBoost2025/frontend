"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeSwitcher from "./ThemeSwitcher";
import MembershipBadge from "./MembershipBadge";

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
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const [query, setQuery] = useState("");

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

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/problems?q=${encodeURIComponent(q)}` : "/problems");
  };

  return (
    <nav
      aria-label="Page header"
      className={`fixed top-0 right-0 z-10 flex h-16 items-center gap-4 border-b border-zinc-200/70 bg-white/70 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0a091e]/80 ${
        isSidebarOpen ? "left-0 px-5 lg:left-60" : "left-0 pl-16 pr-5 lg:px-5"
      }`}
    >
      <div className="min-w-0 flex-1">
        {title ? (
          <h1 className="truncate text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-white">
            {title}
          </h1>
        ) : null}
        {subtitle ? (
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        ) : null}
      </div>

      <form onSubmit={submitSearch} className="hidden md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems…"
            aria-label="Search problems"
            className="h-9 w-56 rounded-full border border-zinc-200/80 bg-zinc-100/60 pl-9 pr-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:w-72 focus:border-brand-500/50 focus:bg-white dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-zinc-100 dark:focus:bg-white/[0.06]"
          />
        </div>
      </form>

      <div className="flex items-center gap-2">
        <div className="hidden sm:block">
          <MembershipBadge compact />
        </div>
        <ThemeSwitcher compact />

        <div className="mx-1 hidden h-6 w-px bg-zinc-200 dark:bg-white/10 sm:block" />

        <div className="flex items-center gap-2.5">
          <div
            className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 bg-cover bg-center text-xs font-bold text-white"
            style={user?.avatarUrl ? { backgroundImage: `url(${user.avatarUrl})` } : undefined}
            role="img"
            aria-label={`${user?.name || "User"} avatar`}
          >
            {user?.avatarUrl ? null : avatarInitial}
            <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/25" />
          </div>
          <div className="hidden leading-tight lg:block">
            <p className="max-w-[120px] truncate text-xs font-semibold text-zinc-800 dark:text-zinc-100">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-brand-500">
              {isAdmin ? "Admin" : "Member"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-full border border-zinc-200/80 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/[0.08] dark:text-zinc-300 dark:hover:bg-white/[0.05] dark:hover:text-white"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
