import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { Buffer } from "buffer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tensorflow/tfjs-node": path.resolve(__dirname, "./src/shims/tfjs-browser-shim.js"),
      "@tensorflow/tfjs": path.resolve(__dirname, "./src/shims/tfjs-browser-shim.js"),
      "./transport": path.resolve(__dirname, "./src/shims/transport-shim.js"),
      "./profiling/primitives": path.resolve(__dirname, "./src/shims/profiling-shim.js"),
      "./observer/prsc": path.resolve(__dirname, "./src/shims/prsc-shim.js"),
    },
  },
  define: {
    global: "globalThis",
  },
}));
