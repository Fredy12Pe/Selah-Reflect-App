// Shim for Node.js diagnostics_channel module in the browser
module.exports = {
  channel: () => ({
    hasSubscribers: false,
    publish: () => false,
    subscribe: () => {},
    unsubscribe: () => {}
  }),
  hasSubscribers: () => false,
  channels: {},
  tracingChannel: () => null
}; 