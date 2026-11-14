import {
  Decoration,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";

const urlMatcher = new MatchDecorator({
  regexp: /\bhttps?:\/\/[^\s;]+/g,
  decoration: (match) =>
    Decoration.mark({
      class: "cm-link",
      attributes: { "data-url": match[0] },
    }),
});

const linkDecorations = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = urlMatcher.createDeco(view);
    }

    update(update: ViewUpdate) {
      this.decorations = urlMatcher.updateDeco(update, this.decorations);
    }
  },
  { decorations: (value) => value.decorations },
);

const linkClick = EditorView.domEventHandlers({
  click({ target }) {
    if (target instanceof Element) {
      const url = target.parentElement?.attributes.getNamedItem("data-url");

      if (url) {
        window.open(url.value, "_blank");
        return true;
      }
    }

    return false;
  },
});

const linkTheme = EditorView.theme({
  ".cm-link": {
    color: "var(--color-muted)",
    textDecoration: "underline",
    cursor: "pointer",
  },
});

const linkExtension = [linkDecorations, linkClick, linkTheme];

export { linkExtension };
