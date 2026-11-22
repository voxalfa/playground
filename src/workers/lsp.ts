import init, { WasmTransport } from "voxalfa-lsp";

let transport: WasmTransport | undefined;
const pendingMessages: string[] = [];

const handleMessage = (message: string) => {
  transport?.process(message);
};

self.onmessage = (event: MessageEvent<string>) => {
  if (transport) {
    handleMessage(event.data);
  } else {
    pendingMessages.push(event.data);
  }
};

init()
  .then(() => {
    console.log("worker: WASM module loaded");

    self.postMessage({ status: "loaded" });

    transport = new WasmTransport((message: string) => {
      self.postMessage(message);
    });

    for (const message of pendingMessages.splice(0)) {
      handleMessage(message);
    }
  })
  .catch((error) => {
    console.error("Failed to load wasm module", error);
  });
