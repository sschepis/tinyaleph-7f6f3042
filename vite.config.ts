import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Custom plugin to handle missing tinyaleph modules
function tinyalephShimPlugin(): Plugin {
  const shimMap: Record<string, string> = {
    "./transport": path.resolve(__dirname, "./src/shims/transport-shim.js"),
    "./profiling/primitives": path.resolve(__dirname, "./src/shims/profiling-shim.js"),
    "./observer/smf": path.resolve(__dirname, "./src/shims/observer-smf-shim.js"),
    "./observer/prsc": path.resolve(__dirname, "./src/shims/observer-prsc-shim.js"),
    "./observer/temporal": path.resolve(__dirname, "./src/shims/observer-temporal-shim.js"),
    "./observer/entanglement": path.resolve(__dirname, "./src/shims/observer-entanglement-shim.js"),
    "./observer/agency": path.resolve(__dirname, "./src/shims/observer-agency-shim.js"),
    "./observer/boundary": path.resolve(__dirname, "./src/shims/observer-boundary-shim.js"),
    "./observer/safety": path.resolve(__dirname, "./src/shims/observer-safety-shim.js"),
    "./observer/hqe": path.resolve(__dirname, "./src/shims/observer-hqe-shim.js"),
  };

  return {
    name: "tinyaleph-shim",
    enforce: "pre",
    resolveId(source, importer) {
      // Intercept known tinyaleph internal imports and map them to browser shims.
      // Note: during build, Rollup can rewrite some imports via CommonJS interop
      // (e.g. "\0./transport?commonjs-external"), so we normalize those IDs.

      const cleaned = source.startsWith("\0") ? source.slice(1) : source;
      const withoutQuery = cleaned.replace(/\?commonjs-external.*$/, "").replace(/\?.*$/, "");

      const shim = shimMap[withoutQuery as keyof typeof shimMap];
      if (!shim) return null;

      const isTinyalephImporter = !!importer && importer.includes("@aleph-ai/tinyaleph");
      const isRollupInterop = source.startsWith("\0") || source.includes("commonjs-external") || (!!importer && importer.includes("commonjs-external"));

      // If this looks like Rollup interop or is coming from tinyaleph, always shim.
      if (isTinyalephImporter || isRollupInterop || !importer) {
        return shim;
      }

      return null;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    tinyalephShimPlugin(),
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tensorflow/tfjs-node": path.resolve(__dirname, "./src/shims/tfjs-browser-shim.js"),
      "@tensorflow/tfjs": path.resolve(__dirname, "./src/shims/tfjs-browser-shim.js"),
    },
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    exclude: ["@aleph-ai/tinyaleph"],
  },
}));
