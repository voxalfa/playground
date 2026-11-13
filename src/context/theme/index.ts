import { createContext, useContext } from "react";
import type { ThemeMode } from "../../config/theme";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }

  return context;
}

export { ThemeContext, useTheme, type ThemeContextValue };
