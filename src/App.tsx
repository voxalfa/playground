import lspWorkerUrl from "./workers/lsp?worker&url";
import type { MonacoVscodeApiConfig } from "monaco-languageclient/vscodeApiWrapper";
import { MonacoEditorReactComp } from "@typefox/monaco-editor-react";
import { LogLevel } from "vscode";
import { editorAppConfig } from "./config/editor";
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
  console.log(lspWorkerUrl);

  return (
    <MonacoEditorReactComp
      vscodeApiConfig={vscodeApiConfig}
      editorAppConfig={editorAppConfig}
      languageClientConfig={languageClientConfig}
      style={{ height: "100vh" }}
      onError={(err) => console.error("Monaco error:", err)}
    />
  );
}

export default App;
