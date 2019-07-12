const { logger } = require('defra-logging-facade')
const wreck = require('@hapi/wreck')
const {
  addressLookUpUri: uri,
  addressLookUpUsername: username,
  addressLookUpPassword: password,
  addressLookUpKey: key
} = require('../../../config')

const method = 'POST'
const maxresults = 100

const requestHeaders = {
  Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
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

async function lookUpByPostcode (postcode) {
  logger.info('Searching for postcode: ' + postcode)

  // all attributes are optional
  const requestOptions = {
    payload: requestPayload(postcode),
    headers: requestHeaders
  }

  // Call the address lookup service
  const res = await wreck.request(method, uri, requestOptions)
  const responseBody = await wreck.read(res, readOptions)

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

module.exports = {
  lookUpByPostcode
}
