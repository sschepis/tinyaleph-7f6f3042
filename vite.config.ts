import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Shim paths for tinyaleph internal modules that may be missing
const shimPaths = [
  './transport',
  './transport.js',
  './profiling/primitives',
  './profiling/primitives.js',
  './observer/prsc',
  './observer/prsc.js',
  './observer/smf',
  './observer/smf.js',
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: 'tinyaleph-shim-resolver',
      resolveId(source: string) {
        if (shimPaths.includes(source)) {
          return { id: 'virtual:empty-shim', moduleSideEffects: false };
        }
        return null;
      },
      load(id: string) {
        if (id === 'virtual:empty-shim') {
          return 'export default {}; export const SmfField = class {}; export const Transport = class {};';
        }
        return null;
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
}));
