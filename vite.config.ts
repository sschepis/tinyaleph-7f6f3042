import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Patch for @aleph-ai/tinyaleph@1.6.2: core/index.js imports `modInverse` twice
// (from crt-homology.js and hilbert.js), which causes a SyntaxError at runtime.
const tinyAlephCoreModInverseFix = () => ({
  name: "tinyaleph-core-modinverse-fix",
  enforce: "pre" as const,
  transform(code: string, id: string) {
    if (!id.includes("/node_modules/@aleph-ai/tinyaleph/core/index.js")) return null;

    // Remove the *second* `modInverse` (from hilbert.js import list) to avoid
    // duplicate identifier declarations. Keep the CRT-Homology `modInverse`.
    const next = code.replace(/(\bdiscreteLog,\s*)\bmodInverse,\s*/m, "$1");

    return next === code ? null : { code: next, map: null };
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    tinyAlephCoreModInverseFix(),
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
  build: {
    rollupOptions: {
      // Exclude example JS files from bundling - they're just code samples for display
      external: (id) => id.includes('/src/examples/') && id.endsWith('.js'),
    },
    commonjsOptions: {
      // Handle duplicate exports in @aleph-ai/tinyaleph library
      strictRequires: true,
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    exclude: ['@aleph-ai/tinyaleph'],
  },
}));
