// Shim for missing telemetry/metrics module in @aleph-ai/tinyaleph
// This provides a no-op implementation to satisfy the import

export const metrics = {
  increment: () => {},
  decrement: () => {},
  gauge: () => {},
  histogram: () => {},
  timer: () => ({ end: () => {} }),
  counter: () => ({ inc: () => {} }),
};

export default metrics;
