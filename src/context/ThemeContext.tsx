"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextValue {
  dark: boolean;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ dark: false, toggleDark: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cec_dark");
      if (saved !== null) {
        const isDark = saved === "true";
        setDark(isDark);
        document.documentElement.classList.toggle("dark", isDark);
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setDark(prefersDark);
        document.documentElement.classList.toggle("dark", prefersDark);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem("cec_dark", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ dark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
