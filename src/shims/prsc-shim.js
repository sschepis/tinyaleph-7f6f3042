// Browser shim for observer/prsc module from @aleph-ai/tinyaleph
// This provides no-op implementations for Node.js-specific PRSC functionality

export const createPRSC = () => ({
  update: () => {},
  getState: () => ({}),
  reset: () => {},
});

export const PRSCLayer = class {
  update() {}
  getState() { return {}; }
  reset() {}
};

export default {
  createPRSC,
  PRSCLayer,
};
