const { logger } = require('defra-logging-facade')
const wreck = require('@hapi/wreck')
const {
  addressLookUpEnabled: enabled,
  addressLookUpUri: uri,
  addressLookUpUsername: username,
  addressLookUpPassword: password,
  addressLookUpKey: key
} = require('../../../config')

const method = 'POST'
const maxresults = 100

const requestHeaders = {
  'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
  'Content-Type': 'application/json'
}

const requestPayload = (postcode) => {
  return {
    postcode,
    key,
    dataset: 'DPA',
    offset: '0',
    lr: 'EN',
    maxresults
  }
}

const readOptions = {
  json: true
}

async function addressLookup (postcode) {
  logger.info('Searching for postcode: ' + postcode)

  // all attributes are optional
  const requestOptions = {
    payload: requestPayload(postcode),
    headers: requestHeaders
  }

  let responseBody = {}

  if (enabled) {
    // Call the address lookup service
    try {
      const res = await wreck.request(method, uri, requestOptions)
      responseBody = await wreck.read(res, readOptions)
    } catch (error) {
      throw error
    }
  } else {
    // Test response rather than calling API
    logger.warn('Getting stubbed addresses')
    responseBody = require('./addressLookupResponseExample.json')
  }

  // Format results into an array of addresses with camelcase properties
  const { error, results = [] } = responseBody
  if (error) {
    logger.debug(error.message)
    return { errorCode: '111', message: error.message.split(':')[1].trim() }
  }
  const addresses = results.map(({ Address }) => {
    const address = {}
    Object.entries(Address).forEach(([prop, val]) => {
      // Set first character of property to lowercase unless uprn
      if (prop.toLowerCase() === 'uprn') {
        prop = prop.toLowerCase()
      } else {
        prop = prop.charAt(0).toLowerCase() + prop.slice(1)
      }
      address[prop] = val
    })
    return address
  })

  return addresses
}

module.exports = addressLookup
