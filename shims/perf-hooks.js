// Shim for Node.js perf_hooks module in the browser
module.exports = {
  performance: typeof performance !== 'undefined' ? performance : {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByName: () => [],
    getEntriesByType: () => [],
    clearMarks: () => {},
    clearMeasures: () => {}
  },
  PerformanceObserver: class PerformanceObserver {
    constructor() {}
    observe() {}
    disconnect() {}
  },
  monitorEventLoopDelay: () => ({
    enable: () => {},
    disable: () => {},
    reset: () => {}
  })
}; 