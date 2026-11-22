import { basicSetup } from "codemirror";
import { lintGutter } from "@codemirror/lint";
import { LSPClient, LSPPlugin } from "@codemirror/lsp-client";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { useEffect, useRef, useState, type RefObject } from "react";
import { createEditorTheme, type ThemeMode } from "./theme";
import {
  diagnosticsField,
  toPreviewDiagnostics,
  type PreviewDiagnostics,
} from "./diagnostics";
import { voxalfaLanguage } from "./language";
import { linkExtension } from "./links";
import {
  createLspClient,
  createWorkerTransport,
  FILE_URI,
  LANGUAGE_ID,
} from "./lsp";
import { customKeymaps } from "./keymap";
import { LoaderCircle, CircleX } from "lucide-react";

const themeCompartment = new Compartment();
const fontSizeCompartment = new Compartment();

const fontSizeTheme = (fontSize: number) =>
  EditorView.theme({ "&": { fontSize: `${fontSize}px` } });

interface CodeEditorProps {
  initialText: string;
  mode: ThemeMode;
  isMobile: boolean;
  viewRef: RefObject<EditorView | null>;
  onTextChange: (text: string) => void;
  onDiagnostics: (diagnostics: PreviewDiagnostics) => void;
}

type LoadingStatus =
  | { name: "loading" | "loaded" }
  | { name: "error"; message: string };

function CodeEditor(props: CodeEditorProps) {
  const { viewRef } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<LoadingStatus>({ name: "loading" });

  const callbacksRef = useRef({
    onTextChange: props.onTextChange,
    onDiagnostics: props.onDiagnostics,
  });

  const initialPropsRef = useRef({
    initialText: props.initialText,
    mode: props.mode,
    isMobile: props.isMobile,
  });

  const handleTextChnage = (update: ViewUpdate) => {
    if (update.docChanged) {
      callbacksRef.current.onTextChange(update.state.doc.toString());
      LSPPlugin.get(update.view)?.client.sync();
    }

    if (
      update.startState.field(diagnosticsField) !==
      update.state.field(diagnosticsField)
    ) {
      callbacksRef.current.onDiagnostics(toPreviewDiagnostics(update.state));
    }
  };

  useEffect(() => {
    callbacksRef.current = {
      onTextChange: props.onTextChange,
      onDiagnostics: props.onDiagnostics,
    };
  }, [props.onTextChange, props.onDiagnostics]);

  useEffect(() => {
    const parent = containerRef.current;

    if (!parent) return;

    setStatus({ name: "loading" });

    let client: LSPClient | null = null;
    let cancelled = false; // strict mode hack
    let disposeTransport: (() => void) | null = null;

    const initializeView = async () => {
      const { initialText, mode, isMobile } = initialPropsRef.current;
      const workerTransport = await createWorkerTransport();

      disposeTransport = workerTransport.dispose;

      if (cancelled) return;

      client = createLspClient();
      client.connect(workerTransport.transport);

      try {
        await client.initializing;
        if (cancelled) return;
        setStatus({ name: "loaded" });
      } catch (error) {
        if (!cancelled) {
          setStatus({ name: "error", message: `${error}` });
          console.error("LSP initialization failed", error);
        }
      }

      viewRef.current = new EditorView({
        state: EditorState.create({
          doc: initialText,
          extensions: [
            customKeymaps,
            basicSetup,
            voxalfaLanguage,
            linkExtension,
            lintGutter(),
            themeCompartment.of(createEditorTheme(mode)),
            fontSizeCompartment.of(fontSizeTheme(isMobile ? 13 : 15)),
            diagnosticsField,
            client.plugin(FILE_URI, LANGUAGE_ID),
            EditorView.updateListener.of(handleTextChnage),
          ],
        }),
        parent,
      });
    };

    initializeView();

    return () => {
      cancelled = true;
      viewRef.current?.destroy();
      client?.disconnect();
      disposeTransport?.();
      viewRef.current = null;
    };
  }, [viewRef]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: themeCompartment.reconfigure(createEditorTheme(props.mode)),
    });
  }, [props.mode, viewRef]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: fontSizeCompartment.reconfigure(
        fontSizeTheme(props.isMobile ? 13 : 15),
      ),
    });
  }, [props.isMobile, viewRef]);

  return (
    <>
      {status.name === "loading" && (
        <div
          key="loading"
          className="flex h-full flex-col items-center justify-center gap-3"
        >
          <LoaderCircle className="h-5 w-5 animate-spin text-accent" />
          <p className="text-xs text-muted">Loading editor…</p>
        </div>
      )}

      {status.name === "error" && (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <CircleX className="h-8 w-8 text-accent" />
          <p>Failed to initialize the editor</p>
          <p className="text-sm text-muted">Try reloading the page</p>
        </div>
      )}

      <div
        ref={containerRef}
        className="editor-host h-full w-full overflow-hidden"
      />
    </>
  );
}

export { CodeEditor };
