
// This is a shim for stream/web to allow builds to complete
module.exports = {
  ReadableStream: class ReadableStream {},
  WritableStream: class WritableStream {},
  TransformStream: class TransformStream {},
  ByteLengthQueuingStrategy: class ByteLengthQueuingStrategy {},
  CountQueuingStrategy: class CountQueuingStrategy {}
};