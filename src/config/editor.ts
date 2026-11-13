import type { EditorAppConfig } from "monaco-languageclient/editorApp";
import sampleFile from "../assets/scores/follow-me.vfa?raw";

const editorAppConfig: EditorAppConfig = {
  codeResources: {
    modified: {
      text: sampleFile,
      uri: "/workspace/score.vfa",
    },
  },
  editorOptions: {
    fontSize: 15,
    minimap: { enabled: false },
    suggest: {
      showWords: false,
    },
  },
  languageDef: {
    languageExtensionConfig: {
      id: "voxalfa",
      extensions: [".vfa"],
      aliases: ["Voxalfa"],
    },
    monarchLanguage: {
      includeLF: true,
      tokenizer: {
        root: [
          [/^[ \t]*\[/, { token: "delimiter.bracket", next: "@header" }],
          [
            /^[ \t]*(---|==|<<|--|\+\+)(?=[ \t]*(?:;|\n|$))/,
            "keyword.delimiter",
          ],
          [/^[ \t]*;;/, { token: "comment", next: "@directiveMarker" }],
          [/;.*/, "comment"],
        ],

        directiveMarker: [
          [/@/, { token: "keyword", switchTo: "@directiveName" }],
          [/\n/, "", "@pop"],
        ],

        directiveName: [
          [/[ \t]+/, ""],
          [/[a-zA-Z][\w-]*/, { token: "keyword", switchTo: "@directive" }],
          [/\n/, "", "@pop"],
        ],

        directive: [
          [/;.*/, "comment", "@pop"],
          [/\|/, "operator"],
          [/[a-zA-Z][\w-]*(?=[ \t]*=)/, "variable"],
          [/=/, { token: "operator", next: "@directiveValue" }],
          [/[ \t]+/, ""],
          [/\n/, "", "@pop"],
          [/[^\n;|]+/, "comment"],
        ],

        directiveValue: [
          [/"[^"\n]*"/, "string"],
          [/\{/, { token: "delimiter.bracket", next: "@listValue" }],
          [/\|/, { token: "operator", next: "@pop" }],
          [/;.*/, "comment", "@popall"],
          [/\n/, "", "@popall"],
          [/[^|;\n]+/, ""],
        ],

        listValue: [
          [/\}/, { token: "delimiter.bracket", next: "@pop" }],
          [/"[^"\n]*"/, "string"],
          [/\b(true|false)\b/, "constant"],
          [/\d*\.\d+/, "number"],
          [/\d+/, "number"],
          [/\.\.|:/, "operator"],
          [/[,]/, "operator"],
          [/[a-zA-Z#][\w-]*/, "variable"],
          [/\n/, "", "@popall"],
        ],

        header: [
          [/#/, { token: "keyword", switchTo: "@marker" }],
          [/\$/, { token: "keyword", switchTo: "@marker" }],
          [/\d+/, { token: "number", switchTo: "@lyric" }],
          [/\*/, { token: "keyword", switchTo: "@lyric" }],
          [/[a-zA-Z][\w-]*/, { token: "type", switchTo: "@solfa" }],
          [/\n/, "", "@pop"],
        ],

        marker: [
          [/\]/, { token: "delimiter.bracket", switchTo: "@assignment" }],
          [/\n/, "", "@pop"],
        ],

        assignment: [
          [/;.*/, "comment", "@pop"],
          [/\|/, "operator"],
          [/=/, "operator"],
          [/"[^"\n]*"/, "string"],
          [/\b(true|false)\b/, "constant"],
          [/\d*\.\d+/, "number"],
          [/\d+/, "number"],
          [/\.\./, "operator"],
          [/[{}()]/, "delimiter.bracket"],
          [/[,:]/, "operator"],
          [/[a-zA-Z#][\w-]*/, "variable"],
          [/\n/, "", "@pop"],
        ],

        solfa: [
          [/\]/, "delimiter.bracket"],
          [/;.*/, "comment", "@pop"],
          [/\|\|/, "delimiter"],
          [/\|/, "operator"],
          [/[drmfslt]/, "identifier"],
          [/[ai]/, "type"],
          [/[+-]\d/, "number"],
          [/[!.:,`]/, "operator"],
          [/-/, "operator"],
          [/[ \t]+/, ""],
          [/\n/, "", "@pop"],
        ],

        lyric: [
          [/\]/, "delimiter.bracket"],
          [/;.*/, "comment", "@pop"],
          [/@@/, "delimiter"],
          [/@/, "operator"],
          [/\d+/, "number"],
          [/&(bls|tld|btk|lpr|rpr|atr|amp|scl)\b/, "constant"],
          [/~/, "constant"],
          [/_+/, "operator"],
          [/\\+/, "operator"],
          [/[()`]/, "delimiter.bracket"],
          [/\n/, "", "@pop"],
        ],
      },
    },
    theme: {
      name: "voxalfa-dark",
      data: {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {},
      },
    },
  },
};

export { editorAppConfig };
