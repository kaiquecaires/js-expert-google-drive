import Busboy from 'busboy'
import { pipeline } from 'stream/promises'
import fs from 'fs'
import { logger } from './logger'
class UpdloadHandler {
  constructor ({ io, socketId, downloadsFolder }) {
    this.io = io
    this.socketId = socketId
    this.downloadsFolder = downloadsFolder
  }

  handleFileBytes () {

  }

  async onFile (fieldName, file, fileName) {
    const saveTo = `${this.downloadsFolder}/${fileName}`

    await pipeline(
      // get a readable stream
      file,
      // filter, to convert, to transform
      this.handleFileBytes.apply(this, [ fileName ]),
      // out of the proccess, a write stream
      fs.createWriteStream(saveTo)
    )

    logger.info(`File [${fileName}] finished`)
  }

  registerEvents (headers, onFinish) {
    const busboy = new Busboy({ headers })
    busboy.on('file', this.onFile.bind(this))
    busboy.on('finish', onFinish)
    return busboy
  }
}

export default UpdloadHandler
