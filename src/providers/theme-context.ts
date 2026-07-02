import { createContext } from "react";

type Theme = "light" | "dark" | "system";

export type ThemeContextValue = {
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  theme: Theme;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
