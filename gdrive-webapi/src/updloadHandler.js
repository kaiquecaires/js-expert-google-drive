import Busboy from 'busboy'

class UpdloadHandler {
  constructor ({ io, socketId }) {

  }

  onFile (fieldName, file, fileName) {

  }

  registerEvents (headers, onFinish) {
    const busboy = new Busboy({ headers })
    busboy.on('file', this.onFile.bind(this))
    busboy.on('finish', onFinish)
    return busboy
  }
}

export default UpdloadHandler
