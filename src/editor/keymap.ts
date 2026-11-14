import type { KeyBinding } from "@codemirror/view";
import { downloadBlob } from "../lib/download";

const customKeymaps: KeyBinding[] = [
  {
    key: "Mod-s",
    run: (view) => {
      const text = view.state.doc.toString();
      downloadBlob(text, "score.vfa", "text");
      return true;
    },
    preventDefault: true,
  },
];

export { customKeymaps };
