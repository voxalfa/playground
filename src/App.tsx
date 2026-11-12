import { MonacoEditorReactComp } from "@typefox/monaco-editor-react";
import type { MonacoVscodeApiConfig } from "monaco-languageclient/vscodeApiWrapper";
import { LogLevel } from "vscode";
import { editorAppConfig } from "./config/editor";

const vscodeApiConfig: MonacoVscodeApiConfig = {
  $type: "classic",
  viewsConfig: { $type: "EditorService" },
  logLevel: LogLevel.Info,
};

function App() {
  return (
    <MonacoEditorReactComp
      vscodeApiConfig={vscodeApiConfig}
      editorAppConfig={editorAppConfig}
      style={{ height: "100vh" }}
      onError={(err) => console.error("Monaco error:", err)}
    />
  );
}

export default App;
