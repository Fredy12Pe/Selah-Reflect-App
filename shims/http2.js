// Shim for Node.js http2 module in the browser
module.exports = {
  constants: {},
  getDefaultSettings: () => ({}),
  getPackedSettings: () => ({}),
  getUnpackedSettings: () => ({}),
  createServer: () => ({}),
  createSecureServer: () => ({}),
  connect: () => ({
    close: () => {},
    on: () => {},
    once: () => {},
    setTimeout: () => {}
  })
};