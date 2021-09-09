import { Readable, Writable, Transform } from 'stream'

class TestUtil {
  static generateReadableStream (data) {
    return new Readable({
      objectMode: true,
      async read() {
        for (const item of data) {
          this.push(item)
        }

        this.push(null)
      }
    })
  }

  static generateWritableStream (onData) {
    return new Writable({
      objectMode: true,
      write(chunk, enconding, cb) {
        onData(chunk)
        cb(null, chunk)
      }
    })
  }

  static generateTransformStream (onData) {
    return new Transform({
      objectMode: true,
      transform(chunk, enconding, cb) {
        onData(chunk)
        cb(null, chunk)
      }
    })
  }
}

export default TestUtil
