const Joi = require('@hapi/joi')
const addressLookup = require('../../../lib/connectors/address-lookup/addressLookup')

class AddressFindHandlers extends require('../handlers') {
  get schema () {
    return {
      'postcode': Joi.string().required()
    }
  }

  get errorMessages () {
    return {
      'postcode': {
        'any.empty': 'Enter a valid postcode',
        'any.required': 'Enter a valid postcode'
      }
    }
  }

  async getAddress (request) {
    return this.getCache(request, this.addressType) || {}
  }

  async setAddress (request, address) {
    return this.setCache(request, this.addressType, address)
  }

  // Overrides parent class getHandler
  async getHandler (request, h, errors) {
    const address = await this.getAddress(request)
    this.viewData = {
      postcode: address.postcode
    }
    return super.getHandler(request, h, errors)
  }

  // Overrides parent class postHandler
  async postHandler (request, h) {
    const address = await this.getAddress(request)
    const postcode = request.payload.postcode.toUpperCase().replace(/\s/g, '') // Capitalise and remove spaces

    if (postcode !== address.postcode) {
      address.postcode = postcode
      const addresses = await addressLookup(postcode)
      if (addresses.errorCode) {
        // Fake the error "any.required" above
        const { error } = Joi.object({ postcode: Joi.required() }).validate({})
        return this.failAction(request, h, error)
      }
      address.postcodeAddressList = addresses
    }

    await this.setAddress(request, address)
    return super.postHandler(request, h)
  }
}

module.exports = AddressFindHandlers