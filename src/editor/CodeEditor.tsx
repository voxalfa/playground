import { basicSetup } from "codemirror";
import { lintGutter } from "@codemirror/lint";
import { LSPClient, LSPPlugin } from "@codemirror/lsp-client";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { useEffect, useRef, type RefObject } from "react";
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

function CodeEditor(props: CodeEditorProps) {
  const { viewRef } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const callbacksRef = useRef({
    onTextChange: props.onTextChange,
    onDiagnostics: props.onDiagnostics,
  });

  const initialPropsRef = useRef({
    initialText: props.initialText,
    mode: props.mode,
    isMobile: props.isMobile,
  });

  useEffect(() => {
    callbacksRef.current = {
      onTextChange: props.onTextChange,
      onDiagnostics: props.onDiagnostics,
    };
  }, [props.onTextChange, props.onDiagnostics]);

  useEffect(() => {
    const parent = containerRef.current;

    if (!parent) {
      return;
    }

    let view: EditorView | null = null;
    let client: LSPClient | null = null;
    let disposeTransport: (() => void) | null = null;
    let cancelled = false;

    // strict mode workaround for clean initialization
    const timer = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      const { initialText, mode, isMobile } = initialPropsRef.current;
      const workerTransport = createWorkerTransport();
      disposeTransport = workerTransport.dispose;

      client = createLspClient();
      client.connect(workerTransport.transport);
      client.initializing.catch((error) => {
        if (!cancelled) {
          console.error("LSP initialization failed", error);
        }
      });

      view = new EditorView({
        state: EditorState.create({
          doc: initialText,
          extensions: [
            basicSetup,
            voxalfaLanguage,
            linkExtension,
            lintGutter(),
            themeCompartment.of(createEditorTheme(mode)),
            fontSizeCompartment.of(fontSizeTheme(isMobile ? 13 : 15)),
            diagnosticsField,
            client.plugin(FILE_URI, LANGUAGE_ID),
            keymap.of(customKeymaps),
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                callbacksRef.current.onTextChange(update.state.doc.toString());
                LSPPlugin.get(update.view)?.client.sync();
              }

              if (
                update.startState.field(diagnosticsField) !==
                update.state.field(diagnosticsField)
              ) {
                callbacksRef.current.onDiagnostics(
                  toPreviewDiagnostics(update.state),
                );
              }
            }),
          ],
        }),
        parent,
      });

      viewRef.current = view;
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      view?.destroy();
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
    <div
      ref={containerRef}
      className="editor-host h-full w-full overflow-hidden"
    />
  );
}

export { CodeEditor };
