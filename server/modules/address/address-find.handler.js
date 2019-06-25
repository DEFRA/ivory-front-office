const Joi = require('@hapi/joi')

class AddressFindHandlers extends require('../common/handlers') {
  get schema () {
    return {
      'postcode': Joi.string().required()
    }
  }

  get errorMessages () {
    return {
      'postcode': {
        'any.empty': 'Enter a valid postcode'
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
      // Remove the cache of addresses (if they exist) related to the previous postcode
      delete address.postcodeAddressList
    }

    await this.setAddress(request, address)
    return super.postHandler(request, h)
  }
}

module.exports = AddressFindHandlers
