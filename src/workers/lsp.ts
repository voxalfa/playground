import init, { WasmTransport } from "voxalfa-lsp";

let transport: WasmTransport | undefined;
const pendingMessages: unknown[] = [];

const handleMessage = (data: unknown) => {
  // console.log("received message", data);
  transport.process(JSON.stringify(data));
};

self.onmessage = (event: MessageEvent) => {
  if (transport) {
    handleMessage(event.data);
  } else {
    pendingMessages.push(event.data);
  }
};

init()
  .then(() => {
    console.log("WASM module loaded");

    transport = new WasmTransport((message: string) => {
      // console.debug("posting message", message);
      return self.postMessage(JSON.parse(message));
    });

    for (const data of pendingMessages.splice(0)) {
      handleMessage(data);
    }
  })
  .catch((error) => {
    console.error("Failed to load wasm module", error);
  });
