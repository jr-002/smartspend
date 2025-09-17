
import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProviderContext, Theme } from "@/lib/theme-context-utils";
import { useTheme } from "@/lib/theme-utils";

type Theme = "light" | "dark" | "system";
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};


export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "smart-spend-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = () => {
      root.classList.remove("light", "dark");

      let resolvedTheme: "light" | "dark";
      
      if (theme === "system") {
        resolvedTheme = mediaQuery.matches ? "dark" : "light";
      } else {
        resolvedTheme = theme;
      }

      root.classList.add(resolvedTheme);
      setActualTheme(resolvedTheme);

      // Update meta theme-color for better mobile experience
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content', 
          resolvedTheme === 'dark' 
            ? 'hsl(220, 15%, 8%)' 
            : 'hsl(240, 15%, 97%)'
        );
      }
    };

    updateTheme();

    // Listen for system theme changes
    mediaQuery.addEventListener('change', updateTheme);

    return () => {
      mediaQuery.removeEventListener('change', updateTheme);
    };
  }, [theme]);

  const value = {
    theme,
    actualTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

