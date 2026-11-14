import {
  LSPClient,
  findReferencesKeymap,
  formatKeymap,
  hoverTooltips,
  jumpToDefinitionKeymap,
  renameKeymap,
  serverCompletionSource,
  serverDiagnostics,
  signatureHelp,
  type Transport,
} from "@codemirror/lsp-client";
import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import LspWorker from "../workers/lsp?worker";
import { captureDiagnostics } from "./diagnostics";

const FILE_URI = "file:///workspace/score.vfa";
const LANGUAGE_ID = "voxalfa";

interface WorkerTransport {
  transport: Transport;
  dispose: () => void;
}

function createWorkerTransport(): WorkerTransport {
  const worker = new LspWorker();
  const handlers = new Set<(message: string) => void>();
  let disposed = false;

  worker.addEventListener("message", (event: MessageEvent<string>) => {
    for (const handler of handlers) {
      handler(event.data);
    }
  });

  worker.addEventListener("error", (event) => {
    console.error("LSP worker error:", event.message);
  });

  return {
    transport: {
      send(message) {
        if (!disposed) {
          worker.postMessage(message);
        }
      },
      subscribe(handler) {
        handlers.add(handler);
      },
      unsubscribe(handler) {
        handlers.delete(handler);
      },
    },
    dispose() {
      disposed = true;
      handlers.clear();
      worker.terminate();
    },
  };
}

function createLspClient(): LSPClient {
  return new LSPClient({
    rootUri: "file:///workspace",
    timeout: 5000,
    notificationHandlers: {
      "textDocument/publishDiagnostics": captureDiagnostics,
    },
    extensions: [
      hoverTooltips(),
      signatureHelp(),
      keymap.of([
        ...formatKeymap,
        ...renameKeymap,
        ...jumpToDefinitionKeymap,
        ...findReferencesKeymap,
      ]),
      EditorState.languageData.of(() => [
        { autocomplete: serverCompletionSource },
      ]),
      serverDiagnostics(),
    ],
  });
}

export {
  createLspClient,
  createWorkerTransport,
  FILE_URI,
  LANGUAGE_ID,
  type WorkerTransport,
};
