"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  BookOpen,
  Code2,
  Home,
  ShieldCheck,
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
  { label: "Dashboard", href: "/", icon: Home },
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
  const { isAdmin } = useAuth();

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
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-20 flex h-screen w-60 flex-col border-r border-zinc-200 bg-zinc-50/95 backdrop-blur transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-950/95 ${
          isOpen ? "translate-x-0" : "-translate-x-60"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">
              ML
            </div>
            <span className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">
              MLBoost
            </span>
          </div>
          {onClose ? (
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <nav className="px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isProblemsChild =
                item.href === "/problems" && pathname.startsWith("/problems/");
              const isActive = pathname === item.href || isProblemsChild;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-zinc-200 px-3 py-4 dark:border-zinc-800">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            Topics
          </p>
          <div className="space-y-1">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleTopicClick(category)}
                className={`w-full rounded-md px-2 py-1.5 text-left text-xs transition ${
                  selectedCategory === category
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
                    : "text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {isOpen ? (
        <div
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      ) : null}
    </>
  );
}
