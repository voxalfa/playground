import { useEffect, useRef, useState } from "react";
import { formatDocument } from "@codemirror/lsp-client";
import type { EditorView } from "@codemirror/view";
import init from "voxalfa-lib";
import defaultText from "./assets/scores/follow-me.vfa?raw";
import { Navbar } from "./components/Navbar";
import Preview from "./components/Preview";
import { useTheme } from "./context/theme";
import { CodeEditor } from "./editor/CodeEditor";
import type { PreviewDiagnostics } from "./editor/diagnostics";
import { useMediaQuery } from "./hooks/useMediaQuery";

function App() {
  const { mode } = useTheme();
  const isMobile = useMediaQuery("(max-width: 700px)");
  const editorViewRef = useRef<EditorView | null>(null);
  const [editorText, setEditorText] = useState(defaultText);
  const [diagnostics, setDiagnostics] = useState<PreviewDiagnostics>({
    errors: [],
    ready: false,
  });
  const [showPreview, setShowPreview] = useState(!isMobile);
  const [wasmLoaded, setWasmLoaded] = useState(false);

  useEffect(() => {
    init()
      .then(() => setWasmLoaded(true))
      .catch((error) => console.error("Failed to load WASM module", error));
  }, []);

  const formatDocumentHandler = () => {
    const view = editorViewRef.current;

    if (view) {
      formatDocument(view);
    }
  };

  const importSource = (text: string) => {
    const view = editorViewRef.current;

    if (view) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: text },
        selection: { anchor: 0 },
        scrollIntoView: true,
      });
    }
  };

  return (
    <div data-theme={mode} className="flex h-screen flex-col bg-background">
      <Navbar
        onPreviewToggle={() => setShowPreview((prev) => !prev)}
        onFormat={formatDocumentHandler}
        onImport={importSource}
        source={editorText}
      />

      <div className="relative flex min-h-0 flex-1">
        <div className="min-w-0 flex-1">
          <CodeEditor
            initialText={defaultText}
            mode={mode}
            isMobile={isMobile}
            viewRef={editorViewRef}
            onTextChange={setEditorText}
            onDiagnostics={setDiagnostics}
          />
        </div>

        {showPreview && (
          <Preview
            editorText={editorText}
            errors={diagnostics.errors}
            diagnosticsReady={diagnostics.ready}
            wasmLoaded={wasmLoaded}
          />
        )}
      </div>
    </div>
  );
}

export default App;
