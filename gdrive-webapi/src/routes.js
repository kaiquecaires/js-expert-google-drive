import { logger } from "./logger.js"

class Routes {
  io

  constructor () {

  }

  setSocketInstance (io) {
    this.io = io
  }

  async defaultRoute (request, response) {
    response.end('hello world')
  }

  async options (request, response) {
    response.writeHead(204)
  }

  async post (request, response) {
    logger.info('[POST]')
    response.end()
  }

  async get (request, response) {
    logger.info('[GET]')
    response.end()
  }

  async handler (request, response) {
    response.setHeader('Access-Control-Allow-Orgin', '*')
    const chosen = this[request.method.toLowerCase()] || this.defaultRoute
    return chosen.apply(this, [request, response])
  }
}

export default Routes
