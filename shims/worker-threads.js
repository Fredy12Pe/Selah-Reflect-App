// Shim for Node.js worker_threads module in the browser
module.exports = {
  Worker: typeof Worker !== 'undefined' ? Worker : class Worker {},
  MessageChannel: typeof MessageChannel !== 'undefined' ? MessageChannel : class MessageChannel {},
  MessagePort: typeof MessagePort !== 'undefined' ? MessagePort : class MessagePort {},
  isMainThread: true
};