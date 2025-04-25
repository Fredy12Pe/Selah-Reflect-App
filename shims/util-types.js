// Shim for Node.js util/types module in the browser
module.exports = {
  isArrayBufferView: () => false,
  isUint8Array: (obj) => Object.prototype.toString.call(obj) === '[object Uint8Array]',
  isUint16Array: (obj) => Object.prototype.toString.call(obj) === '[object Uint16Array]',
  isUint32Array: (obj) => Object.prototype.toString.call(obj) === '[object Uint32Array]',
  isInt8Array: (obj) => Object.prototype.toString.call(obj) === '[object Int8Array]',
  isInt16Array: (obj) => Object.prototype.toString.call(obj) === '[object Int16Array]',
  isInt32Array: (obj) => Object.prototype.toString.call(obj) === '[object Int32Array]',
  isFloat32Array: (obj) => Object.prototype.toString.call(obj) === '[object Float32Array]',
  isFloat64Array: (obj) => Object.prototype.toString.call(obj) === '[object Float64Array]',
  isDate: (obj) => obj instanceof Date,
  isRegExp: (obj) => obj instanceof RegExp
}; 