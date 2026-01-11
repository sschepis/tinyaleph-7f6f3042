// Browser shim for transport module
// Provides no-op implementations for Node.js transport functionality

export const createTransport = () => ({
  send: async () => {},
  receive: async () => null,
  close: () => {},
});

export const Transport = class {
  constructor() {}
  send() { return Promise.resolve(); }
  receive() { return Promise.resolve(null); }
  close() {}
};

export default { createTransport, Transport };
