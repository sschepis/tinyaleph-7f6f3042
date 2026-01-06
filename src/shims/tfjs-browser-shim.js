/**
 * Browser shim for TensorFlow packages.
 *
 * tinyaleph's optional TF integration is Node-first (tfjs-node) and not meant
 * to run in this Vite/React browser demo. We export a silent no-op module
 * so the library gracefully degrades without throwing console errors.
 * 
 * All TensorFlow operations should be performed via the tensorflow-compute
 * edge function instead.
 */

// Export an empty object that won't throw when accessed
const noopTensor = {
  ready: () => Promise.resolve(),
  tensor: () => ({ dispose: () => {} }),
  zeros: () => ({ dispose: () => {} }),
  ones: () => ({ dispose: () => {} }),
  dispose: () => {},
  loadLayersModel: () => Promise.reject(new Error("TensorFlow is disabled in browser")),
};

export default noopTensor;
export const ready = noopTensor.ready;
export const tensor = noopTensor.tensor;
export const zeros = noopTensor.zeros;
export const ones = noopTensor.ones;
export const dispose = noopTensor.dispose;
export const loadLayersModel = noopTensor.loadLayersModel;
