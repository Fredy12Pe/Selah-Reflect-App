// Shim for Node.js stream/web module in the browser
module.exports = {
  ReadableStream: typeof ReadableStream !== 'undefined' ? ReadableStream : class ReadableStream {},
  WritableStream: typeof WritableStream !== 'undefined' ? WritableStream : class WritableStream {},
  TransformStream: typeof TransformStream !== 'undefined' ? TransformStream : class TransformStream {},
  ByteLengthQueuingStrategy: typeof ByteLengthQueuingStrategy !== 'undefined' ? ByteLengthQueuingStrategy : class ByteLengthQueuingStrategy {},
  CountQueuingStrategy: typeof CountQueuingStrategy !== 'undefined' ? CountQueuingStrategy : class CountQueuingStrategy {}
}; 