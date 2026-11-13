import { useEffect, useRef, useState } from "react";
import * as vscode from "vscode";
import { FILE_URI } from "../config/editor";

export interface PreviewError {
  line?: number;
  column?: number;
  code?: string;
  message: string;
}

interface DiagnosticsSnapshot {
  errors: PreviewError[];
  text: string;
}

function toPreviewError(diagnostic: vscode.Diagnostic): PreviewError {
  return {
    line: diagnostic.range.start.line + 1,
    column: diagnostic.range.start.character + 1,
    message: diagnostic.message,
    code:
      diagnostic.code === undefined
        ? undefined
        : typeof diagnostic.code === "object"
          ? String(diagnostic.code.value)
          : String(diagnostic.code),
  };
}

function collectErrors(): PreviewError[] {
  const entry = vscode.languages
    .getDiagnostics()
    .find(([uri]) => uri.path === FILE_URI);

  return (entry?.[1] ?? [])
    .filter(
      (diagnostic) => diagnostic.severity === vscode.DiagnosticSeverity.Error,
    )
    .map(toPreviewError);
}

function useDiagnostics(ready: boolean, text: string) {
  const [snapshot, setSnapshot] = useState<DiagnosticsSnapshot>({
    errors: [],
    text,
  });
  const latestText = useRef(text);

  useEffect(() => {
    latestText.current = text;
  }, [text]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const update = () =>
      setSnapshot({ errors: collectErrors(), text: latestText.current });

    update();

    const subscription = vscode.languages.onDidChangeDiagnostics((event) => {
      if (event.uris.some((uri) => uri.path === FILE_URI)) {
        update();
      }
    });

    return () => subscription.dispose();
  }, [ready]);

  // prevent stale errors
  return { errors: snapshot.text === text ? snapshot.errors : [] };
}

export { useDiagnostics };
