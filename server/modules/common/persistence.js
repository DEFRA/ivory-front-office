const Wreck = require('@hapi/wreck')
const { logger } = require('defra-logging-facade')
const config = require('../../config')
const { getNestedVal } = require('../../lib/utils')

module.exports = class Persistence {
  constructor (options = {}) {
    Object.assign(this, options)
  }

  async save (data) {
    const { serviceApi, serviceApiEnabled } = config

    if (!serviceApiEnabled) {
      logger.warn('Service API is Disabled')
      return data
    }

    const { id } = data
    const method = id ? 'PATCH' : 'POST'
    const path = id ? `${this.path}/${id}` : this.path
    const uri = serviceApi + path
    const payloadData = Object.assign({}, data, { id: undefined })

    const headers = { 'Content-Type': 'application/json' }
    const payload = JSON.stringify(payloadData)

    try {
      const res = await Wreck.request(method, uri, { headers, payload })
      return Wreck.read(res, { json: true })
    } catch (error) {
      const { statusCode, message } = getNestedVal(error, 'output.payload') || {}
      logger.error(`message: ${message}, statusCode: ${statusCode}, method: ${method}, uri: ${uri}, payload: ${payload}`)
      throw error
    }
  }
}
