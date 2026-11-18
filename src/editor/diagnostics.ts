import { StateEffect, StateField, type EditorState } from "@codemirror/state";
import type { LSPClient } from "@codemirror/lsp-client";
import type { PublishDiagnosticsParams } from "vscode-languageserver-protocol";

export interface PreviewError {
  line: number;
  column: number;
  message: string;
  code?: string;
}

export interface PreviewDiagnostics {
  errors: PreviewError[];
  ready: boolean;
}

const setPreviewDiagnostics = StateEffect.define<PreviewDiagnostics>();

const diagnosticsField = StateField.define<PreviewDiagnostics>({
  create: () => ({ errors: [], ready: false }),
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(setPreviewDiagnostics)) {
        return effect.value;
      }
    }

    // Any edit invalidates the current diagnostics until the server responds.
    return transaction.docChanged ? { errors: [], ready: false } : value;
  },
});

function captureDiagnostics(
  client: LSPClient,
  params: PublishDiagnosticsParams,
): boolean {
  const file = client.workspace.getFile(params.uri);

  if (!file || (params.version != null && params.version !== file.version)) {
    return false;
  }

  const view = file.getView();

  if (!view) {
    return false;
  }

  const errors: PreviewError[] = [];

  for (const diagnostic of params.diagnostics) {
    if ((diagnostic.severity ?? 1) !== 1) {
      continue;
    }

    errors.push({
      line: diagnostic.range.start.line + 1,
      column: diagnostic.range.start.character + 1,
      message:
        typeof diagnostic.message === "string"
          ? diagnostic.message
          : diagnostic.message.value,
      code: diagnostic.code ? String(diagnostic.code) : undefined,
    });
  }

  view.dispatch({
    effects: setPreviewDiagnostics.of({ errors, ready: true }),
  });

  return false;
}

function toPreviewDiagnostics(state: EditorState): PreviewDiagnostics {
  return state.field(diagnosticsField);
}

export { captureDiagnostics, diagnosticsField, toPreviewDiagnostics };
