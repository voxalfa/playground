import { useEffect, useState } from "react";
import { editor } from "@codingame/monaco-vscode-editor-api";
import lspWorkerUrl from "./workers/lsp?worker&url";
import type { MonacoVscodeApiConfig } from "monaco-languageclient/vscodeApiWrapper";
import { MonacoEditorReactComp } from "@typefox/monaco-editor-react";
import { LogLevel } from "vscode";
import { editorAppConfig } from "./config/editor";
import { themes, themeName } from "./config/theme";
import { useTheme } from "./context/theme";
import { Navbar } from "./components/Navbar";
import {
  LcWorker,
  type LanguageClientConfig,
} from "monaco-languageclient/lcwrapper";

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
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    if (apiReady) {
      editor.setTheme(themeName(mode));
    }
  }, [apiReady, mode]);

  const handleApiInit = () => {
    editor.defineTheme(themeName("light"), themes.light);
    editor.defineTheme(themeName("dark"), themes.dark);
    setApiReady(true);
  };

  return (
    <div data-theme={mode} className="flex h-screen flex-col bg-background">
      <Navbar />
      <div className="min-h-0 flex-1">
        <MonacoEditorReactComp
          vscodeApiConfig={vscodeApiConfig}
          editorAppConfig={editorAppConfig}
          languageClientConfig={languageClientConfig}
          style={{ height: "100%" }}
          onVscodeApiInitDone={handleApiInit}
          onError={(err) => console.error("Monaco error:", err)}
        />
      </div>
    </div>
  );
}

export default App;
