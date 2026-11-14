import { useEffect, useState } from "react";
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

  return (
    <div data-theme={mode} className="flex h-screen flex-col bg-background">
      <Navbar onPreviewToggle={() => setShowPreview((prev) => !prev)} />

      <div className="relative flex min-h-0 flex-1">
        <div className="min-w-0 flex-1">
          <CodeEditor
            initialText={defaultText}
            mode={mode}
            isMobile={isMobile}
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
