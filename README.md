# Playground

**[Try it now →](https://voxalfa.github.io/playground/)**

The Voxalfa playground is built on top of the [CodeMirror](https://codemirror.net/) editor. It integrates the official LSP through WebAssembly workers via [@codemirror/lsp-client](https://github.com/codemirror/lsp-client), so it has almost every feature the native LSP provides.

<br/>

<div align="center">
    <img width="700" alt="Screenshot" src="https://github.com/user-attachments/assets/8ea88318-afe2-445e-bb89-00bd0f4df14e" />
</div>

## Features

- Full LSP support (diagnostics, completion, hover, formatting, rename, definitions, references, signature help, ...) running locally in the browser
- Syntax highlighting powered by CodeMirror
- Live score preview
- MIDI and SVG export
- Everything runs client-side via WebAssembly

## Limitations

- Custom fonts and PDFs are not supported in the playground.

## Development

```bash
npm run submodule:init
npm run build:wasm
npm install
npm run dev
```

## License

See [LICENSE](LICENSE).
