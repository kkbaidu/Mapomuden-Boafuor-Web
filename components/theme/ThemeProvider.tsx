"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface ThemeContextValue {
  theme: "light" | "dark" | "system";
  effectiveTheme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (t: "light" | "dark" | "system") => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "theme";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const getSystemPref = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  const [theme, setThemeState] = useState<"light" | "dark" | "system">(() => {
    if (typeof window === "undefined") return "system";
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as
        | "light"
        | "dark"
        | "system"
        | null;
      if (stored === "light" || stored === "dark" || stored === "system")
        return stored;
    } catch {}
    return "system";
  });
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(() =>
    theme === "system" ? getSystemPref() : theme
  );

  const apply = (t: "light" | "dark") => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    // add a brief transition class
    root.classList.add("theme-transition");
    if (t === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    window.setTimeout(() => root.classList.remove("theme-transition"), 300);
  };

  useEffect(() => {
    const listener = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        const next = e.matches ? "dark" : "light";
        setEffectiveTheme(next);
        apply(next);
      }
    };
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [theme]);

  useEffect(() => {
    const eff = theme === "system" ? getSystemPref() : theme;
    setEffectiveTheme(eff);
    apply(eff);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const setTheme = (t: "light" | "dark" | "system") => setThemeState(t);
  const toggleTheme = () =>
    setThemeState((p) =>
      p === "light" ? "dark" : p === "dark" ? "system" : "light"
    );

  return (
    <ThemeContext.Provider
      value={{ theme, effectiveTheme, toggleTheme, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
