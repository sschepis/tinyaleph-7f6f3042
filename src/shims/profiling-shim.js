// Browser shim for profiling/primitives module from @aleph-ai/tinyaleph
// This provides no-op implementations for Node.js-specific profiling functionality

export const startSpan = () => ({
  end: () => {},
  setAttribute: () => {},
});

export const trace = (fn) => fn;
export const measure = () => {};
export const profile = () => ({
  stop: () => {},
});

export default {
  startSpan,
  trace,
  measure,
  profile,
};
