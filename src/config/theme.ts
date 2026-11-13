import type { EditorAppConfig } from "monaco-languageclient/editorApp";

type ThemeData = NonNullable<
  NonNullable<EditorAppConfig["languageDef"]>["theme"]
>["data"];

export type ThemeMode = "light" | "dark";

const palettes = {
  light: {
    background: "#e1e1db",
    surface: "#d8d8d2",
    border: "#c1c1bb",
    foreground: "#262625",
    muted: "#6e6b5e",
    accent: "#8c391f",
    string: "#2b79a2",
  },
  dark: {
    background: "#141414",
    surface: "#1a1a1a",
    border: "#262626",
    foreground: "#bfbdb6",
    muted: "#6e6e6e",
    accent: "#c18639",
    string: "#6f9fbf",
  },
};

const themeName = (mode: ThemeMode) => `voxalfa-${mode}`;

function opacity(color: string, value: number): string {
  const alpha = Math.round(value * 255)
    .toString(16)
    .padStart(2, "0");
  return `${color}${alpha}`;
}

function createTheme(mode: ThemeMode): ThemeData {
  const palette = palettes[mode];

  return {
    base: mode === "dark" ? "vs-dark" : "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: palette.muted, fontStyle: "italic" },
      { token: "keyword", foreground: palette.accent },
      { token: "keyword.delimiter", foreground: palette.accent },
      { token: "operator", foreground: palette.accent },
      { token: "number", foreground: palette.accent },
      { token: "string", foreground: palette.string },
      { token: "constant", foreground: palette.string },
      { token: "type", foreground: palette.string },
      { token: "identifier", foreground: palette.foreground },
      { token: "variable", foreground: palette.foreground },
      { token: "delimiter", foreground: palette.muted },
      { token: "delimiter.bracket", foreground: palette.muted },
    ],
    colors: {
      "editor.background": palette.background,
      "editor.foreground": palette.foreground,
      "editor.lineHighlightBackground": palette.surface,
      "editor.lineHighlightBorder": opacity(palette.background, 0),
      "editor.selectionBackground": opacity(palette.accent, 0.2),
      "editor.inactiveSelectionBackground": opacity(palette.accent, 0.1),
      "editor.selectionHighlightBackground": opacity(palette.accent, 0.15),
      "editor.wordHighlightBackground": opacity(palette.accent, 0.15),
      "editor.wordHighlightStrongBackground": opacity(palette.accent, 0.2),
      "editor.findMatchBackground": opacity(palette.accent, 0.4),
      "editor.findMatchHighlightBackground": opacity(palette.accent, 0.2),
      "editorCursor.foreground": palette.accent,
      "editorLineNumber.foreground": palette.muted,
      "editorLineNumber.activeForeground": palette.accent,
      "editorGutter.background": palette.background,
      "editorIndentGuide.background1": opacity(palette.foreground, 0.1),
      "editorIndentGuide.activeBackground1": opacity(palette.foreground, 0.2),
      "editorWhitespace.foreground": opacity(palette.foreground, 0.1),
      "editorBracketMatch.background": opacity(palette.accent, 0.15),
      "editorBracketMatch.border": palette.muted,
      "editorWidget.background": palette.surface,
      "editorWidget.border": palette.border,
      "editorSuggestWidget.background": palette.surface,
      "editorSuggestWidget.border": palette.border,
      "editorSuggestWidget.selectedBackground": opacity(palette.accent, 0.15),
      "editorSuggestWidget.highlightForeground": palette.accent,
      "editorHoverWidget.background": palette.surface,
      "editorHoverWidget.border": palette.border,
      "editorOverviewRuler.border": opacity(palette.background, 0),
      "scrollbarSlider.background": opacity(palette.muted, 0.5),
      "scrollbarSlider.hoverBackground": opacity(palette.muted, 0.8),
      "scrollbarSlider.activeBackground": palette.accent,
      "list.hoverBackground": palette.surface,
      "list.activeSelectionBackground": opacity(palette.accent, 0.15),
      "list.activeSelectionForeground": palette.foreground,
      "list.inactiveSelectionBackground": opacity(palette.foreground, 0.05),
      "input.background": palette.surface,
      "input.border": palette.border,
      focusBorder: palette.accent,
      "badge.background": palette.accent,
      "badge.foreground": palette.background,
      "menu.background": palette.surface,
      "menu.border": palette.border,
      "menu.selectionBackground": opacity(palette.accent, 0.15),
      "statusBar.background": palette.surface,
      "statusBar.foreground": palette.foreground,
      "panel.background": palette.background,
      "sideBar.background": palette.background,
      "titleBar.activeBackground": palette.background,
      "titleBar.activeForeground": palette.foreground,
    },
  };
}

const themes: Record<ThemeMode, ThemeData> = {
  light: createTheme("light"),
  dark: createTheme("dark"),
};

export { themes, themeName };
