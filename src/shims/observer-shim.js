// Browser shim for observer/smf module from @aleph-ai/tinyaleph
// This provides no-op implementations for Node.js-specific observer functionality

export const createObserver = () => ({
  observe: () => {},
  disconnect: () => {},
  notify: () => {},
});

export const SMFObserver = class {
  observe() {}
  disconnect() {}
  notify() {}
};

export default {
  createObserver,
  SMFObserver,
};
