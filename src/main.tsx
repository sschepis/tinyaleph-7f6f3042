import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
// Polyfill Buffer for browser environment
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}

import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
