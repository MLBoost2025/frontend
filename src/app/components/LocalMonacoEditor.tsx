"use client";

import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorker: () => Worker;
    };
  }
}

if (typeof window !== "undefined") {
  window.MonacoEnvironment = {
    getWorker: () =>
      new Worker(
        new URL("monaco-editor/esm/vs/editor/editor.worker.js", import.meta.url),
        { type: "module", name: "katalume-monaco" }
      ),
  };
}

// @monaco-editor/react defaults to a third-party CDN. Supplying the bundled
// ESM runtime keeps the arena functional on restricted networks and makes the
// production artifact self-contained.
loader.config({ monaco });

export default Editor;
