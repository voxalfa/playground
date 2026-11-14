import { StreamLanguage, type StringStream } from "@codemirror/language";

type VoxalfaMode =
  | "root"
  | "directiveMarker"
  | "directiveName"
  | "directive"
  | "directiveValue"
  | "listValue"
  | "header"
  | "marker"
  | "assignment"
  | "solfa"
  | "lyric";

interface Rule {
  match: RegExp;
  token?: string;
  next?: VoxalfaMode;
  sol?: boolean;
}

interface VoxalfaState {
  mode: VoxalfaMode;
}

const grammar: Record<VoxalfaMode, readonly Rule[]> = {
  root: [
    { match: /^[ \t]*\[/, token: "bracket", next: "header", sol: true },
    {
      match: /^[ \t]*(?:---|==|<<|--|\+\+)(?=[ \t]*(?:;|$))/,
      token: "keyword",
      sol: true,
    },
    {
      match: /^[ \t]*;;/,
      token: "comment",
      next: "directiveMarker",
      sol: true,
    },
    { match: /^;.*/, token: "comment" },
  ],

  directiveMarker: [
    { match: /^[ \t]+/ },
    { match: /^@/, token: "keyword", next: "directiveName" },
  ],

  directiveName: [
    { match: /^[ \t]+/ },
    { match: /^[a-zA-Z][\w-]*/, token: "keyword", next: "directive" },
  ],

  directive: [
    { match: /^;.*/, token: "comment" },
    { match: /^\|/, token: "operator" },
    { match: /^[a-zA-Z][\w-]*(?=[ \t]*=)/, token: "variableName" },
    { match: /^=/, token: "operator", next: "directiveValue" },
    { match: /^[ \t]+/ },
    { match: /^[^;|\n]+/, token: "comment" },
  ],

  directiveValue: [
    { match: /^"[^"\n]*"/, token: "string" },
    { match: /^\{/, token: "bracket", next: "listValue" },
    { match: /^\|/, token: "operator", next: "directive" },
    { match: /^;.*/, token: "comment" },
    { match: /^[^|;\n]+/ },
  ],

  listValue: [
    { match: /^\}/, token: "bracket", next: "directiveValue" },
    { match: /^"[^"\n]*"/, token: "string" },
    { match: /^\b(?:true|false)\b/, token: "bool" },
    { match: /^\d*\.\d+/, token: "number" },
    { match: /^\d+/, token: "number" },
    { match: /^(?:\.\.|:)/, token: "operator" },
    { match: /^,/, token: "operator" },
    { match: /^[a-zA-Z#][\w-]*/, token: "variableName" },
    { match: /^[ \t]+/ },
  ],

  header: [
    { match: /^#/, token: "keyword", next: "marker" },
    { match: /^\$/, token: "keyword", next: "marker" },
    { match: /^\d+/, token: "number", next: "lyric" },
    { match: /^\*/, token: "keyword", next: "lyric" },
    { match: /^[a-zA-Z][\w-]*/, token: "typeName", next: "solfa" },
  ],

  marker: [{ match: /^\]/, token: "bracket", next: "assignment" }],

  assignment: [
    { match: /^;.*/, token: "comment" },
    { match: /^\|/, token: "operator" },
    { match: /^=/, token: "operator" },
    { match: /^"[^"\n]*"/, token: "string" },
    { match: /^\b(?:true|false)\b/, token: "bool" },
    { match: /^\d*\.\d+/, token: "number" },
    { match: /^\d+/, token: "number" },
    { match: /^\.\./, token: "operator" },
    { match: /^[{}()]/, token: "bracket" },
    { match: /^[,:]/, token: "operator" },
    { match: /^[a-zA-Z#][\w-]*/, token: "variableName" },
    { match: /^[ \t]+/ },
  ],

  solfa: [
    { match: /^\]/, token: "bracket" },
    { match: /^;.*/, token: "comment" },
    { match: /^\|\|/, token: "separator" },
    { match: /^\|/, token: "operator" },
    { match: /^[drmfslt]/, token: "variableName" },
    { match: /^[ai]/, token: "typeName" },
    { match: /^[+-]\d/, token: "number" },
    { match: /^[!.:,`]/, token: "operator" },
    { match: /^-/, token: "operator" },
    { match: /^[ \t]+/ },
  ],

  lyric: [
    { match: /^\]/, token: "bracket" },
    { match: /^;.*/, token: "comment" },
    { match: /^@@/, token: "separator" },
    { match: /^@/, token: "operator" },
    { match: /^\d+/, token: "number" },
    { match: /^&(?:bls|tld|btk|lpr|rpr|atr|amp|scl)\b/, token: "bool" },
    { match: /^~/, token: "bool" },
    { match: /^_+/, token: "operator" },
    { match: /^\\+/, token: "operator" },
    { match: /^[()`]/, token: "bracket" },
    { match: /^[ \t]+/ },
  ],
};

function tokenize(stream: StringStream, state: VoxalfaState): string | null {
  for (const rule of grammar[state.mode]) {
    if (rule.sol && !stream.sol()) {
      continue;
    }

    if (!stream.match(rule.match)) {
      continue;
    }

    if (rule.next !== undefined) {
      state.mode = rule.next;
    }

    if (stream.eol()) {
      state.mode = "root";
    }

    return rule.token ?? null;
  }

  stream.next();

  if (stream.eol()) {
    state.mode = "root";
  }

  return null;
}

const voxalfaLanguage = StreamLanguage.define<VoxalfaState>({
  name: "voxalfa",
  startState: () => ({ mode: "root" }),
  token: tokenize,
  blankLine: (state) => {
    state.mode = "root";
  },
  languageData: {
    commentTokens: { line: ";" },
    closeBrackets: { brackets: ["[", "{", "("] },
  },
});

export { voxalfaLanguage };
