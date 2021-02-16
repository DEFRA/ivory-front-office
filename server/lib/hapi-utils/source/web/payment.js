const { logger } = require('defra-logging-facade')
const wreck = require('@hapi/wreck')
const joi = require('joi')

module.exports = class Payment {
  constructor (config) {
    const schema = joi.object({
      paymentsUrl: joi.string().uri().required(),
      apiKey: joi.string().required(),
      amount: joi.number(),
      reference: joi.string(),
      description: joi.string(),
      returnUrl: joi.string().uri()
    })

    // Validate the config
    const { value, error } = schema.validate(config, {
      abortEarly: false
    })

    // Throw if config is invalid
    if (error) {
      throw new Error(`The payment config is invalid. ${error.message}`)
    }

    Object.assign(this, value)
  }

  get headers () {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }

  get payload () {
    // eslint-disable-next-line camelcase
    const { amount, reference, description, returnUrl: return_url } = this

    return {
      amount,
      reference,
      description,
      language: 'en',
      return_url,
      delayed_capture: false
    }
  }

  // eslint-disable-next-line camelcase
  async requestPayment () {
    const { payload, headers, paymentsUrl } = this
    const { amount, reference } = payload
    logger.info(`Requesting payment of £${amount / 100} for reference ${reference}`)

    // Call the payment service
    const res = await wreck.request('POST', paymentsUrl, { payload, headers })
    const responseBody = await wreck.read(res, { json: true })

    const { code, description } = responseBody
    if (code) {
      responseBody.message = `${code}: ${description}`
      logger.error(responseBody.message)
    }
    return responseBody
  }

  // eslint-disable-next-line camelcase
  async requestStatus (paymentId) {
    const { paymentsUrl, headers } = this
    logger.info(`Requesting status of payment of payment ID ${paymentId}`)

    // Call the payment service
    const res = await wreck.request('GET', `${paymentsUrl}/${paymentId}`, { headers })
    const responseBody = await wreck.read(res, { json: true })

    const { code, description } = responseBody
    if (code) {
      responseBody.message = `${code}: ${description}`
      logger.error(responseBody.message)
    }
    return responseBody
  }
}
