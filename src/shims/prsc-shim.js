// Browser shim for observer/prsc module
// Provides no-op implementations for PRSC observer functionality

export const createPRSC = () => ({
  observe: () => {},
  disconnect: () => {},
  getState: () => ({}),
});

export const PRSCLayer = class {
  constructor() {}
  observe() {}
  disconnect() {}
  getState() { return {}; }
};

export default { createPRSC, PRSCLayer };
