const wreck = require('@hapi/wreck')

// TODO: Should these be in config.js?
const method = 'POST'
const uri = process.env.ADDRESS_LOOKUP_URI
const username = process.env.ADDRESS_LOOKUP_USERNAME
const password = process.env.ADDRESS_LOOKUP_PASSWORD
const key = process.env.ADDRESS_LOOKUP_KEY
const stubRequest = process.env.ADDRESS_LOOKUP_STUB
const maxresults = 40

const requestHeaders = {
  'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
  'Content-Type': 'application/json'
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
  console.log('Searching for postcode: ' + postcode)

  const requestPayload = {
    'postcode': postcode,
    'key': key,
    'dataset': 'DPA',
    'offset': '0',
    'lr': 'EN',
    'maxresults': maxresults
  }

  // all attributes are optional
  const requestOptions = {
    payload: requestPayload,
    headers: requestHeaders
  }

  let responseBody = {}

  if (stubRequest === 'true' || stubRequest === '') {
    // Test response rather than calling API
    console.log('Getting stubbed addresses') // TODO: remove this. What is the proper way to debug/info log?
    responseBody = require('./addressLookupResponseExample.json')
  } else {
    // Call the address lookup service
    const res = await wreck.request(method, uri, requestOptions)
    responseBody = await wreck.read(res, readOptions)
  }

  return responseBody
}

module.exports = addressLookup
