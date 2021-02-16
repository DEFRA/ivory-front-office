const { logger } = require('defra-logging-facade')
const wreck = require('@hapi/wreck')
const joi = require('joi')

module.exports = class AddressLookUp {
  constructor (config) {
    const schema = joi.object({
      uri: joi.string().uri().required(),
      username: joi.string().required(),
      password: joi.string().required(),
      key: joi.string().required(),
      maxresults: joi.number().default(100)
    })

    // Validate the config
    const { value, error } = schema.validate(config, {
      abortEarly: false
    })

    // Throw if config is invalid
    if (error) {
      throw new Error(`The address look up config is invalid. ${error.message}`)
    }

    Object.assign(this, value)
  }

  requestOptions (postcode) {
    const { key, maxresults } = this
    const payload = {
      postcode,
      key,
      dataset: 'DPA',
      offset: '0',
      lr: 'EN',
      maxresults
    }
    const headers = {
      Authorization: 'Basic ' + Buffer.from(this.username + ':' + this.password).toString('base64'),
      'Content-Type': 'application/json'
    }
    return { payload, headers }
  }

  async lookUpByPostcode (postcode) {
    logger.info('Searching for postcode: ' + postcode)

    // Call the address lookup service
    const res = await wreck.request('POST', this.uri, this.requestOptions(postcode))
    const responseBody = await wreck.read(res, { json: true })

    // Format results into an array of addresses with camelcase properties
    const { error, results = [] } = responseBody
    if (error) {
      logger.debug(error.message)
      const errorMessage = error.message.split(':')[1].trim()
      const [message, errorCode] = errorMessage.split(', Code ')
      if (errorCode === '204') {
        // No addresses found
        return []
      }
      return { errorCode, message }
    }
    return results.map(({ Address }) => {
      const address = {}
      Object.entries(Address).forEach(([prop, val]) => {
        // Set first character of property to lowercase unless uprn
        if (prop.toLowerCase() === 'uprn') {
          prop = prop.toLowerCase()
        } else {
          prop = prop.charAt(0).toLowerCase() + prop.slice(1)
        }
        switch (prop) {
          case 'subBuildingName':
            prop = 'businessName'
            break
          case 'buildingName':
            prop = 'addressLine1'
            break
          case 'buildingNumber':
          case 'street':
            prop = 'addressLine2'
            break
        }
        address[prop] = address[prop] ? `${address[prop]} ${val}` : val
      })
      if (!address.addressLine1) {
        address.addressLine1 = address.addressLine2
        delete address.addressLine2
      }
      return address
    })
  }
}
