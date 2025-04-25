/**
 * Shim for undici/lib/core/util.js
 * Provides browser-compatible implementations of Node.js-specific features used by undici
 */

// Mock Node.js version (this is what undici tries to access with process.versions.node)
const nodeVersion = '16.0.0';

// Mock process.versions for browser
const process = {
  versions: {
    node: nodeVersion
  }
};

// Export functions that undici uses
module.exports = {
  nodeVersion,
  process,
  // Common util functions that undici might use
  getServerName: () => null,
  isDisturbed: () => false,
  isErrored: () => false,
  isDestroyed: () => false,
  parseKeepAliveTimeout: (val) => {
    if (val === undefined) {
      return 1e3;
    }
    return val;
  },
  headerNameToString: (name) => {
    if (typeof name === 'string') {
      return name;
    }
    return String(name).toLowerCase();
  },
  splitUrl: (url) => {
    const { hostname, pathname, search, port, protocol } = new URL(url);
    return {
      hostname,
      port: port ? parseInt(port, 10) : (protocol === 'https:' ? 443 : 80),
      path: pathname + search
    };
  }
}; 