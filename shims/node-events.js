/**
 * Shim for node:events module
 * This file provides a browser-compatible version of the Node.js events module
 */

const events = require('events');
module.exports = events; 