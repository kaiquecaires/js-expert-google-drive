import { logger } from "./logger.js"
import FileHelper from "./fileHelper.js"
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultDownloadsFolder = resolve(__dirname, '../', 'downloads')

class Routes {
  io

  constructor (downloadsFolder = defaultDownloadsFolder) {
    this.downloadsFolder = downloadsFolder
    this.fileHelper = FileHelper
  }

  setSocketInstance (io) {
    this.io = io
  }

  async defaultRoute (request, response) {
    response.end('hello world')
  }

  async options (request, response) {
    response.writeHead(204)
    response.end()
  }

  async post (request, response) {
    logger.info('[POST]')
    response.end()
  }

  async get (request, response) {
    const files = await this.fileHelper.getFileStatus(this.downloadsFolder)
    response.writeHead(200)
    response.end(JSON.stringify(files))
  }

  async handler (request, response) {
    response.setHeader('Access-Control-Allow-Orgin', '*')
    const chosen = this[request.method.toLowerCase()] || this.defaultRoute
    return chosen.apply(this, [request, response])
  }
}

export default Routes
