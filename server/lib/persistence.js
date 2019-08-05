const Wreck = require('@hapi/wreck')
const merge = require('lodash.merge')
const { logger } = require('defra-logging-facade')
const config = require('../config')
const { getNestedVal, cloneAndMerge } = require('ivory-shared').utils

module.exports = class Persistence {
  constructor (options = {}) {
    merge(this, options)
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
    const { serviceApi, serviceApiEnabled } = config

    if (!serviceApiEnabled) {
      logger.warn('Service API is Disabled')
      return { id }
    }

    const method = 'GET'
    const path = `${this.path}/${id}`
    const uri = serviceApi + path
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
