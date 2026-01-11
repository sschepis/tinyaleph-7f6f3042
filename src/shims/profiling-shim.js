// Browser shim for profiling/primitives module from @aleph-ai/tinyaleph
// This provides no-op implementations for Node.js-specific profiling functionality

export const startSpan = () => ({
  end: () => {},
  setStatus: () => {},
  setAttribute: () => {},
});

export const trace = (name, fn) => fn();
export const measure = () => ({ stop: () => {} });
export const profile = () => ({ stop: () => {} });

export default {
  startSpan,
  trace,
  measure,
  profile,
};
