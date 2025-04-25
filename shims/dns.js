// Shim for Node.js dns module in the browser
module.exports = {
  lookup: (hostname, options, callback) => {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    if (typeof callback === 'function') {
      // Always return localhost in browser environment
      callback(null, '127.0.0.1', 4);
    }
  },
  resolve: (hostname, callback) => {
    if (typeof callback === 'function') {
      callback(null, ['127.0.0.1']);
    }
  },
  promises: {
    lookup: async () => ({ address: '127.0.0.1', family: 4 }),
    resolve: async () => ['127.0.0.1']
  }
}; 