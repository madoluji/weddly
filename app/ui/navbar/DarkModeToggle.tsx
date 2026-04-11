"use client";

import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/app/context/ThemeProvider";
import { useEffect, useState } from "react";

interface DarkModeToggleProps {
  className?: string;
}

export function DarkModeToggle({ className }: DarkModeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container transition-colors ${className ?? ""}`}
    >
      {isDark ? (
        <SunIcon className="h-8 w-8" />
      ) : (
        <MoonIcon className="h-8 w-8" />
      )}
    </button>
  );
}

export default DarkModeToggle;
