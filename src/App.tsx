import { useEffect, useRef, useState } from "react";
import { editor } from "@codingame/monaco-vscode-editor-api";
import lspWorkerUrl from "./workers/lsp?worker&url";
import type { MonacoVscodeApiConfig } from "monaco-languageclient/vscodeApiWrapper";
import { MonacoEditorReactComp } from "@typefox/monaco-editor-react";
import { LogLevel } from "vscode";
import {
  DESKTOP_EDITOR_OPTIONS,
  editorAppConfig,
  MOBILE_EDITOR_OPTIONS,
} from "./config/editor";
import { themes, themeName } from "./config/theme";
import { useTheme } from "./context/theme";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { Navbar } from "./components/Navbar";
import {
  LcWorker,
  type LanguageClientConfig,
} from "monaco-languageclient/lcwrapper";
import Preview from "./components/Preview";
import defaultText from "./assets/scores/follow-me.vfa?raw";
import init from "voxalfa-lib";
import type { EditorApp } from "monaco-languageclient/editorApp";

const vscodeApiConfig: MonacoVscodeApiConfig = {
  $type: "classic",
  viewsConfig: { $type: "EditorService" },
  logLevel: LogLevel.Info,
};

const languageClientConfig: LanguageClientConfig = {
  languageId: "voxalfa",
  connection: {
    options: {
      workerUrl: new URL(lspWorkerUrl, window.location.href),
      type: "module",
      $family: "Worker",
      realization: () => new LcWorker(),
    },
  },
  clientOptions: {
    documentSelector: ["voxalfa"],
  },
};

function App() {
  const { mode } = useTheme();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [apiReady, setApiReady] = useState(false);
  const [editorText, setEditorText] = useState(defaultText);
  const [showPreview, setShowPreview] = useState(!isMobile);
  const [wasmLoaded, setWasmLoaded] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    init()
      .then(() => setWasmLoaded(true))
      .catch((error) => console.error("Failed to load WASM module", error));
  }, []);

  useEffect(() => {
    editorRef.current?.updateOptions(
      isMobile ? MOBILE_EDITOR_OPTIONS : DESKTOP_EDITOR_OPTIONS,
    );
  }, [isMobile]);

  useEffect(() => {
    if (apiReady) {
      editor.setTheme(themeName(mode));
    }
  }, [apiReady, mode]);

  const handleEditorSetup = (app?: EditorApp) => {
    const instance = app?.getEditor();
    if (instance) {
      editorRef.current = instance;
      instance.updateOptions(
        isMobile ? MOBILE_EDITOR_OPTIONS : DESKTOP_EDITOR_OPTIONS,
      );
    }
  };

  const handleApiInit = () => {
    editor.defineTheme(themeName("light"), themes.light);
    editor.defineTheme(themeName("dark"), themes.dark);
    setApiReady(true);
  };

  return (
    <div data-theme={mode} className="flex h-screen flex-col bg-background">
      <Navbar onPreviewToggle={() => setShowPreview((prev) => !prev)} />

      <div className="relative flex min-h-0 flex-1">
        <div className="min-w-0 flex-1">
          <MonacoEditorReactComp
            vscodeApiConfig={vscodeApiConfig}
            editorAppConfig={editorAppConfig}
            languageClientConfig={languageClientConfig}
            style={{ height: "100%", width: "100%" }}
            onVscodeApiInitDone={handleApiInit}
            onEditorStartDone={handleEditorSetup}
            onTextChanged={(event) => {
              if (event.modified !== undefined) {
                setEditorText(event.modified);
              }
            }}
            onError={(err) => console.error("Monaco error:", err)}
          />
        </div>

        {showPreview && (
          <Preview
            editorText={editorText}
            wasmLoaded={wasmLoaded}
            apiReady={apiReady}
          />
        )}
      </div>
    </div>
  );
}

export default App;
