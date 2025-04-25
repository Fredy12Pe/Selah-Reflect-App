/**
 * Shim for node:stream module
 * This file provides a browser-compatible version of the Node.js stream module
 */

const stream = require('stream-browserify');
module.exports = stream; 