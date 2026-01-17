import { AlephEngine, SemanticBackend } from "@aleph-ai/tinyaleph";

type AnyConfig = Record<string, unknown> & { engineOptions?: Record<string, unknown> };

/**
 * Workaround for a tinyaleph packaging issue where SemanticBackend
 * may be nested inside itself after bundling.
 */
export function createBackend(config: AnyConfig) {
  const Ctor = (SemanticBackend as any)?.SemanticBackend ?? SemanticBackend;
  return new Ctor(config);
}

/**
 * Create a full AlephEngine with semantic backend
 */
export function createSemanticEngine(config: AnyConfig) {
  const backend = createBackend(config);
  return new AlephEngine(backend, (config as any)?.engineOptions || {});
}
