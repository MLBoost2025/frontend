"use client";

import { useEffect, useRef, useState } from "react";
import { useSyncExternalStore } from "react";
import { ChevronDown, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

type ThemeChoice = "light" | "dark" | "system";

const LABELS: Record<ThemeChoice, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

function ThemeIcon({
  theme,
  className,
}: {
  theme: ThemeChoice;
  className?: string;
}) {
  if (theme === "light") {
    return <Sun className={className} />;
  }
  if (theme === "dark") {
    return <Moon className={className} />;
  }
  return <Laptop className={className} />;
}

interface ThemeSwitcherProps {
  compact?: boolean;
}

export default function ThemeSwitcher({ compact = false }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const currentTheme: ThemeChoice = isHydrated
    ? ((theme as ThemeChoice) || "system")
    : "system";

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current) {
        return;
      }
      if (wrapperRef.current.contains(event.target as Node)) {
        return;
      }
      setIsOpen(false);
    };

    window.addEventListener("click", closeOnOutsideClick);
    return () => {
      window.removeEventListener("click", closeOnOutsideClick);
    };
  }, []);

  const options: ThemeChoice[] = ["light", "dark", "system"];

  return (
    <div
      className="relative"
      ref={wrapperRef}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setIsOpen(false);
          buttonRef.current?.focus();
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        aria-label="Theme options"
        aria-controls="theme-options"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <ThemeIcon theme={currentTheme} className="h-3.5 w-3.5" />
        {!compact ? <span>{LABELS[currentTheme]}</span> : null}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {isOpen ? (
        <div
          id="theme-options"
          role="menu"
          aria-label="Theme"
          className="absolute right-0 z-40 mt-2 w-36 rounded-lg border border-black/[0.06] bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="menuitemradio"
              aria-checked={currentTheme === option}
              onClick={() => {
                setTheme(option);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
                currentTheme === option
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              <ThemeIcon theme={option} className="h-3.5 w-3.5" />
              {LABELS[option]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
