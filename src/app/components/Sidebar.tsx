"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  BookOpen,
  Code2,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCircle2,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  isOpen: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Problems", href: "/problems", icon: Code2 },
  { label: "Competitions", href: "/competitions", icon: Trophy },
  { label: "Learn", href: "/learn", icon: BookOpen },
  { label: "Interview Tracks", href: "/tracks", icon: BriefcaseBusiness },
  { label: "Progress", href: "/progress", icon: BarChart3 },
  { label: "Profile", href: "/profile", icon: UserCircle2 },
];

const CATEGORIES = [
  "All Categories",
  "Supervised Learning",
  "Data Preprocessing",
  "Model Evaluation",
];

export default function Sidebar({
  selectedCategory,
  onCategoryChange,
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, user } = useAuth();

  const navItems = isAdmin
    ? [...NAV_ITEMS, { label: "Admin", href: "/admin", icon: ShieldCheck }]
    : NAV_ITEMS;

  const handleTopicClick = (category: string) => {
    onCategoryChange?.(category);
    const url = new URL("/problems", window.location.origin);
    if (category !== "All Categories") {
      url.searchParams.set("category", category);
    }
    router.push(`${url.pathname}${url.search}`);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      onClose?.();
    }
  };

  return (
    <>
      <aside
        id="primary-sidebar"
        aria-label="Primary navigation"
        aria-hidden={!isOpen}
        inert={!isOpen || undefined}
        className={`fixed left-0 top-0 z-20 flex h-screen w-60 flex-col border-r border-zinc-200/70 bg-white/70 backdrop-blur-xl transition-transform duration-300 dark:border-white/[0.06] dark:bg-[#0b0c10]/80 ${
          isOpen ? "translate-x-0" : "-translate-x-60"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-[13px] font-black tracking-tight text-white shadow-[0_4px_14px_-4px_rgba(244,102,31,0.6)]">
              ML
              <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
            </div>
            <div className="leading-none">
              <span className="block text-[15px] font-bold tracking-tight text-zinc-900 dark:text-white">
                MLBoost
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                ML Arena
              </span>
            </div>
          </Link>
          {onClose ? (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-200/60 hover:text-zinc-900 dark:hover:bg-white/5 dark:hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* Primary nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Main navigation">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isProblemsChild =
                item.href === "/problems" && pathname.startsWith("/problems/");
              const isActive = pathname === item.href || isProblemsChild;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-500/[0.10] text-brand-700 dark:bg-brand-500/[0.14] dark:text-brand-300"
                      : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-100"
                  }`}
                >
                  {isActive ? (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" />
                  ) : null}
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 transition ${
                      isActive
                        ? "text-brand-500"
                        : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200"
                    }`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-6">
            <p className="eyebrow mb-2 px-3">Topics</p>
            <div className="space-y-0.5" aria-label="Problem categories">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => handleTopicClick(category)}
                  className={`w-full rounded-lg px-3 py-1.5 text-left text-[13px] transition ${
                    selectedCategory === category
                      ? "bg-zinc-900/[0.05] font-medium text-zinc-900 dark:bg-white/[0.06] dark:text-white"
                      : "text-zinc-500 hover:bg-zinc-200/40 hover:text-zinc-800 dark:text-zinc-500 dark:hover:bg-white/[0.03] dark:hover:text-zinc-300"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer: upgrade / streak card */}
        <div className="p-3">
          <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-500/[0.08] to-accent-500/[0.06] p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-500" />
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                {user?.name ? `Hi, ${user.name.split(" ")[0]}` : "Level up"}
              </p>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              Solve a problem today to keep your streak alive.
            </p>
          </div>
        </div>
      </aside>

      {isOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[15] bg-black/50 lg:hidden"
          onClick={onClose}
          aria-label="Dismiss navigation"
        />
      ) : null}
    </>
  );
}
