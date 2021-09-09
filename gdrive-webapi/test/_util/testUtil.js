import { Readable } from 'stream'

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
}

export default TestUtil
