import { Prec } from "@codemirror/state";
import { keymap, type KeyBinding } from "@codemirror/view";
import {
  acceptCompletion,
  hasNextSnippetField,
  nextSnippetField,
} from "@codemirror/autocomplete";
import { downloadBlob } from "../lib/download";

const keys: KeyBinding[] = [
  {
    key: "Mod-s",
    run: (view) => {
      const text = view.state.doc.toString();
      downloadBlob(text, "score.vfa", "text");
      return true;
    },
    preventDefault: true,
  },
  {
    key: "Enter",
    run: (view) =>
      acceptCompletion(view) ||
      (hasNextSnippetField(view.state) && nextSnippetField(view)),
  },
];

const customKeymaps = Prec.highest(keymap.of(keys));

export { customKeymaps };
