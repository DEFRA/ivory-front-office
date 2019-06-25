const Joi = require('@hapi/joi')
const addressLookup = require('../../lib/connectors/address-lookup/addressLookup')
const chooseAddressHint = 'Choose an address'

class AddressSelectHandlers extends require('../common/handlers') {
  get schema () {
    return {
      'address': Joi.string().regex(/addressLine/)
    }
  }

  get errorMessages () {
    return {
      'address': {
        'string.regex.base': 'Select an address'
      }
    }
  }

  async getAddress (request) {
    return request.yar.get(this.addressType) || {}
  }

  async setAddress (request, address) {
    request.yar.set(this.addressType, address)
  }

  // Overrides parent class getHandler
  async getHandler (request, h, errors) {
    const address = await this.getAddress(request)
    const { postcode, postcodeAddressList } = address

    // Use the cache of postcode addresses (stored as a string) if it exists
    const addresses = postcodeAddressList || await addressLookup(postcode)

    // Use the payload in this special case to force the addresses to be displayed even when there is an error
    request.payload = {
      chooseAddressHint,
      addresses
    }

    address.postcodeAddressList = addresses
    await this.setAddress(request, address)

    return super.getHandler(request, h, errors)
  }

  // Overrides parent class postHandler
  async postHandler (request, h) {
    const address = await this.getAddress(request)

    Object.assign(address, JSON.parse(request.payload.address))
    await this.setAddress(request, address)

    return super.postHandler(request, h)
  }
}

module.exports = AddressSelectHandlers
