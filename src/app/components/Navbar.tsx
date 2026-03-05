"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, Flame, Menu, Search, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  title?: string;
  subtitle?: string;
  onLogout?: () => void;
}

export default function Navbar({
  title,
  subtitle,
  onLogout,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const { user, logout } = useAuth();
  const avatarInitial = useMemo(
    () => user?.name?.trim().charAt(0).toUpperCase() || "U",
    [user]
  );

  const navItems = useMemo(
    () => [
      { label: "Explore", href: "/learn", activeWhen: /^\/learn$/ },
      { label: "Problems", href: "/problems", activeWhen: /^\/problems/ },
      { label: "Contest", href: "/competitions", activeWhen: /^\/competitions/ },
      { label: "Discuss", href: "/progress", activeWhen: /^\/progress/ },
      { label: "Interview", href: "/tracks", activeWhen: /^\/tracks/ },
    ],
    []
  );

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    if (onLogout) {
      onLogout();
      return;
    }
    await logout();
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsMobileMenuOpen(false);
    const query = globalSearch.trim();
    if (!query) {
      router.push("/problems");
      return;
    }
    router.push(`/problems?query=${encodeURIComponent(query)}`);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b border-zinc-800 bg-[#1a1c22]/95 backdrop-blur-md">
      <nav className="mx-auto flex h-14 w-full max-w-[1580px] items-center justify-between gap-3 px-3 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="rounded-md p-2 text-zinc-300 hover:bg-zinc-800/70 md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Link
            href="/problems"
            onClick={() => setIsMobileMenuOpen(false)}
            className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-zinc-100 hover:bg-zinc-800/70"
          >
            <span className="text-lg text-amber-400">△</span>
            <span>MLBoost</span>
          </Link>
          <div className="hidden h-full items-stretch gap-0.5 md:flex">
            {navItems.map((item) => {
              const isActive = item.activeWhen.test(pathname);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex items-center border-b-2 px-3 text-sm transition ${
                    isActive
                      ? "border-amber-400 font-medium text-white"
                      : "border-transparent text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-amber-400 hover:bg-zinc-800/70">
              Store <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <form
            onSubmit={handleSearchSubmit}
            className="hidden h-9 items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 text-zinc-400 md:flex"
          >
            <Search className="h-4 w-4" />
            <input
              aria-label="Search"
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search"
              className="w-36 bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
            />
          </form>
          <button
            aria-label="Notifications"
            className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            aria-label="Streak"
            className="inline-flex items-center gap-1 rounded-md p-2 text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100"
          >
            <Flame className="h-4 w-4" />
            <span className="hidden text-xs text-zinc-500 sm:inline">0</span>
          </button>
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/90 text-xs font-semibold text-zinc-900">
            {avatarInitial}
          </div>
          <button className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-sm text-amber-300 hover:bg-amber-500/30">
            Premium
          </button>
          <button
            onClick={handleLogout}
            className="hidden rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 sm:inline-flex"
          >
            Logout
          </button>
        </div>
      </nav>
      {isMobileMenuOpen ? (
        <div className="border-t border-zinc-800 bg-[#191c23] px-3 py-3 md:hidden">
          <form
            onSubmit={handleSearchSubmit}
            className="mb-3 flex h-10 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-zinc-400"
          >
            <Search className="h-4 w-4" />
            <input
              aria-label="Search"
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
            />
          </form>
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  item.activeWhen.test(pathname)
                    ? "border-amber-400/40 bg-amber-500/10 text-amber-200"
                    : "border-zinc-700 text-zinc-300"
                }`}
                aria-current={item.activeWhen.test(pathname) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button className="flex-1 rounded-lg bg-amber-500/20 px-3 py-2 text-sm text-amber-300">
              Premium
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300"
            >
              Logout
            </button>
          </div>
        </div>
      ) : null}
      {(title || subtitle) && (
        <div className="mx-auto flex w-full max-w-[1580px] items-center justify-between px-3 pb-2 md:px-6 lg:px-8">
          <div className="min-w-0">
            {title ? (
              <h1 className="truncate text-sm font-semibold tracking-tight text-zinc-200 md:text-base">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="truncate text-xs text-zinc-500">{subtitle}</p>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
