"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// --- Types ---

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

// --- Helpers ---

const VALID_THEMES: ThemeMode[] = ["light", "dark", "system"];

function isValidTheme(value: unknown): value is ThemeMode {
  return VALID_THEMES.includes(value as ThemeMode);
}

function getSystemPreference(): "light" | "dark" {
  try {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
  } catch {
    // matchMedia unavailable — fall back to light
  }
  return "light";
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") return getSystemPreference();
  return mode;
}

function applyDarkClass(resolved: "light" | "dark"): void {
  try {
    if (typeof document !== "undefined") {
      if (resolved === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  } catch {
    // DOM unavailable — no-op
  }
}

function readStoredTheme(storageKey: string, fallbackTheme: ThemeMode): ThemeMode {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored !== null && isValidTheme(stored)) return stored;
  } catch {
    // localStorage unavailable — fall back to provided default theme
  }
  return fallbackTheme;
}

function writeStoredTheme(storageKey: string, mode: ThemeMode): void {
  try {
    localStorage.setItem(storageKey, mode);
  } catch {
    // localStorage unavailable — operate in-memory only
  }
}

// --- Context ---

const ThemeContext = createContext<ThemeContextValue | null>(null);

// --- Provider ---

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "weddly-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // On the server there is no localStorage; start with defaultTheme.
    if (typeof window === "undefined") return defaultTheme;
    return readStoredTheme(storageKey, defaultTheme);
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return resolveTheme(theme);
  });

  // Apply the dark class whenever resolvedTheme changes.
  useEffect(() => {
    applyDarkClass(resolvedTheme);
  }, [resolvedTheme]);

  // On mount, sync from localStorage (handles SSR → client handoff).
  useEffect(() => {
    const forcedTheme: ThemeMode = "light";
    writeStoredTheme(storageKey, forcedTheme);
    setThemeState(forcedTheme);
    setResolvedTheme("light");
    applyDarkClass("light");
  }, [defaultTheme, storageKey]);

  // Listen for OS preference changes; only act when theme === 'system'.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    let mediaQuery: MediaQueryList;
    try {
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    } catch {
      return;
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setThemeState((current) => {
        if (current !== "system") return current;
        const newResolved: "light" | "dark" = e.matches ? "dark" : "light";
        setResolvedTheme(newResolved);
        applyDarkClass(newResolved);
        return current;
      });
    };

    try {
      mediaQuery.addEventListener("change", handleChange);
    } catch {
      // Older browsers use addListener
      try {
        (mediaQuery as any).addListener(handleChange);
      } catch {
        // Not supported — no-op
      }
    }

    return () => {
      try {
        mediaQuery.removeEventListener("change", handleChange);
      } catch {
        try {
          (mediaQuery as any).removeListener(handleChange);
        } catch {
          // Not supported — no-op
        }
      }
    };
  }, []);

  const setTheme = useCallback(
    (newMode: ThemeMode) => {
      writeStoredTheme(storageKey, newMode);
      const resolved = resolveTheme(newMode);
      applyDarkClass(resolved);
      setThemeState(newMode);
      setResolvedTheme(resolved);
    },
    [storageKey]
  );

  const toggleTheme = useCallback(() => {
    setResolvedTheme((current) => {
      const next: "light" | "dark" = current === "dark" ? "light" : "dark";
      writeStoredTheme(storageKey, next);
      applyDarkClass(next);
      setThemeState(next);
      return next;
    });
  }, [storageKey]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// --- Hook ---

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error(
      "useTheme() must be called inside a <ThemeProvider>. " +
        "Make sure your component tree is wrapped with <ThemeProvider>."
    );
  }
  return ctx;
}
