import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";

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

function opacity(color: string, value: number): string {
  const alpha = Math.round(value * 255)
    .toString(16)
    .padStart(2, "0");
  return `${color}${alpha}`;
}

function createHighlightStyle(mode: ThemeMode): HighlightStyle {
  const palette = palettes[mode];

  return HighlightStyle.define([
    { tag: tags.comment, color: palette.muted, fontStyle: "italic" },
    { tag: tags.keyword, color: palette.accent },
    { tag: [tags.operator, tags.separator], color: palette.accent },
    { tag: tags.number, color: palette.accent },
    { tag: tags.string, color: palette.string },
    { tag: tags.bool, color: palette.string },
    { tag: tags.typeName, color: palette.string },
    { tag: tags.variableName, color: palette.foreground },
    { tag: tags.bracket, color: palette.muted },
  ]);
}

function createEditorTheme(mode: ThemeMode): Extension {
  const palette = palettes[mode];

  return [
    EditorView.theme(
      {
        "&": {
          color: palette.foreground,
          backgroundColor: palette.background,
        },
        ".cm-content": {
          caretColor: palette.accent,
        },
        ".cm-cursor, .cm-dropCursor": {
          borderLeftColor: palette.accent,
        },
        ".cm-activeLine": {
          backgroundColor: opacity(palette.surface, 0.6),
        },
        ".cm-gutters": {
          backgroundColor: palette.background,
          color: palette.muted,
        },
        ".cm-activeLineGutter": {
          backgroundColor: palette.surface,
          color: palette.accent,
        },
        ".cm-selectionMatch": {
          backgroundColor: opacity(palette.accent, 0.15),
        },
        ".cm-searchMatch": {
          backgroundColor: opacity(palette.accent, 0.3),
        },
        ".cm-searchMatch.cm-searchMatch-selected": {
          backgroundColor: opacity(palette.accent, 0.4),
        },
        ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
          backgroundColor: opacity(palette.accent, 0.15),
          outlineColor: palette.muted,
        },
        ".cm-nonmatchingBracket": {
          color: palette.accent,
        },
        ".cm-tooltip": {
          backgroundColor: palette.surface,
          color: palette.foreground,
          borderColor: palette.border,
        },
        ".cm-tooltip .cm-tooltip-arrow:before": {
          borderTopColor: palette.border,
          borderBottomColor: palette.border,
        },
        ".cm-tooltip .cm-tooltip-arrow:after": {
          borderTopColor: palette.surface,
          borderBottomColor: palette.surface,
        },
        ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
          backgroundColor: opacity(palette.accent, 0.15),
          color: palette.foreground,
        },
        ".cm-completionDetail": {
          color: palette.muted,
        },
        ".cm-diagnostic-error": {
          borderLeftColor: palette.accent,
        },
        ".cm-diagnostic-warning": {
          borderLeftColor: palette.string,
        },
        ".cm-panels": {
          backgroundColor: palette.surface,
          color: palette.foreground,
        },
        ".cm-button": {
          backgroundColor: palette.background,
          color: palette.foreground,
          borderColor: palette.border,
        },
        ".cm-textfield": {
          backgroundColor: palette.background,
          color: palette.foreground,
          borderColor: palette.border,
        },
        ".cm-foldPlaceholder": {
          backgroundColor: palette.surface,
          color: palette.muted,
          borderColor: palette.border,
        },
      },
      { dark: mode === "dark" },
    ),
    syntaxHighlighting(createHighlightStyle(mode)),
  ];
}

export { createEditorTheme };
