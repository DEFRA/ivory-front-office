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
const maxresults = 40

const requestHeaders = {
  'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
  'Content-Type': 'application/json'
}

const requestPayload = (postcode) => {
  return {
    'postcode': postcode,
    'key': key,
    'dataset': 'DPA',
    'offset': '0',
    'lr': 'EN',
    'maxresults': maxresults
  }
}

const readOptions = {
  json: true
}

/**
 * Lookup UK address
 * @param {string} postcode Postcode
 * @return {Promise} Resolves with the address results object
 */
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

  return responseBody
}

module.exports = addressLookup
