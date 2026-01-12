import { AlephEngine, SemanticBackend } from "@aleph-ai/tinyaleph";

type AnyConfig = Record<string, unknown> & { engineOptions?: Record<string, unknown> };

/**
 * Workaround for a tinyaleph packaging issue where `createEngine('semantic', ...)`
 * can throw "SemanticBackend2 is not a constructor" in the browser bundle.
 */
export function createSemanticEngine(config: AnyConfig) {
  const SemanticBackendCtor = (SemanticBackend as any)?.SemanticBackend ?? SemanticBackend;
  const backend = new SemanticBackendCtor(config);
  return new AlephEngine(backend, (config as any)?.engineOptions || {});
}
