// Browser shim for profiling/primitives module
// Provides no-op implementations for Node.js profiling functionality

export const startTrace = () => () => {};
export const measure = () => ({});
export const getMetrics = () => ({});
export const resetMetrics = () => {};

export default { startTrace, measure, getMetrics, resetMetrics };
