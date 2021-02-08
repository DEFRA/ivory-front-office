const Wreck = require('@hapi/wreck')
const joi = require('@hapi/joi')
const { logger } = require('defra-logging-facade')
const { getNestedVal, cloneAndMerge } = require('../utils/utils')

module.exports = class Persistence {
  constructor (config = {}) {
    const schema = joi.object({
      path: joi.string().uri().required(),
      serviceApiEnabled: joi.bool().default(true)
    })

    // Validate the config
    const { value, error } = schema.validate(config, {
      abortEarly: false
    })

    // Throw if config is invalid
    if (error) {
      throw new Error(`The persistence config is invalid. ${error.message}`)
    }

    Object.assign(this, value)
  }

  // This makes it easier to test instantiating Persistence
  static createDAO (...args) {
    return new Persistence(...args)
  }

  async save (data) {
    const { path, serviceApiEnabled = true } = this

    if (!serviceApiEnabled) {
      logger.warn('Service API is Disabled')
      return data
    }

    const { id } = data
    const method = id ? 'PATCH' : 'POST'
    const uri = id ? `${path}/${id}` : path
    const payloadData = cloneAndMerge(data, { id: null })

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

  async restore (id) {
    const { path, serviceApiEnabled = true } = this

    if (!serviceApiEnabled) {
      logger.warn('Service API is Disabled')
      return { id }
    }

    const method = 'GET'
    const uri = id ? `${path}/${id}` : path
    const headers = { 'Content-Type': 'application/json' }

    try {
      const res = await Wreck.request(method, uri, { headers })
      return Wreck.read(res, { json: true })
    } catch (error) {
      const { statusCode, message } = getNestedVal(error, 'output.payload') || {}
      logger.error(`message: ${message}, statusCode: ${statusCode}, method: ${method}, uri: ${uri}`)
      throw error
    }
  }
}
