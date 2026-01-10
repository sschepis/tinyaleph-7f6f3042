// Browser shim for transport module from @aleph-ai/tinyaleph
// This provides no-op implementations for Node.js-specific transport functionality

export const createTransport = () => ({
  send: async () => {},
  receive: async () => null,
  close: () => {},
});

export default {
  createTransport,
};
