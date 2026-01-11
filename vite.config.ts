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
      // (e.g. "\0./profiling/primitives?commonjs-external"), so we cannot rely
      // solely on the importer string containing "@aleph-ai/tinyaleph".
      if (shimMap[source]) {
        if (!importer) return shimMap[source];

        const isTinyalephImporter = importer.includes("@aleph-ai/tinyaleph");
        const isRollupInterop = importer.includes("commonjs-external") || importer.startsWith("\0");

        if (isTinyalephImporter || isRollupInterop) {
          return shimMap[source];
        }
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
