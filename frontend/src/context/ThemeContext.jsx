import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("td_theme") || "system";
  });
  const [resolvedTheme, setResolvedTheme] = useState("light");

  useEffect(() => {
    const root = document.documentElement;
    const value = theme === "system" ? getSystemTheme() : theme;
    root.classList.remove("light", "dark");
    root.classList.add(value);
    setResolvedTheme(value);
    localStorage.setItem("td_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const value = media.matches ? "dark" : "light";
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(value);
      setResolvedTheme(value);
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "light";
      return getSystemTheme() === "dark" ? "light" : "dark";
    });
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      resolvedTheme,
    }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};


