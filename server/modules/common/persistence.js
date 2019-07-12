const Wreck = require('@hapi/wreck')
const { logger } = require('defra-logging-facade')
const { serviceApi, serviceApiEnabled } = require('../../config')

module.exports = class Persistence {
  constructor (options) {
    Object.assign(this, options)
  }

  async save (data) {
    if (!serviceApiEnabled) {
      logger.warn('Service API is Disabled')
      return data
    }
    const { id } = data
    const method = id ? 'PATCH' : 'POST'
    const path = id ? `${this.path}/${id}` : this.path
    const uri = serviceApi + path
    delete data.id
    const headers = {
      'Content-Type': 'application/json'
    }
    const payload = JSON.stringify(data)
    try {
      const res = await Wreck.request(method, uri, { headers, payload })
      return Wreck.read(res, { json: true })
    } catch (error) {
      const { statusCode, message } = error.output.payload
      logger.error(`message: ${message}, statusCode: ${statusCode}, method: ${method}, uri: ${uri}, payload: ${payload}`)
      throw error
    }
  }
}
