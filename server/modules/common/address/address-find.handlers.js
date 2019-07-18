const Joi = require('@hapi/joi')
const addressLookup = require('../../../lib/connectors/address-lookup/addressLookup')
const config = require('../../../config')
const mixin = require('../../../lib/mixin')

class AddressFindHandlers extends mixin(require('../handlers'), require('./address-mixin')) {
  get schema () {
    return Joi.object({
      postcode: Joi.string().required()
    })
  }

  get errorMessages () {
    return {
      postcode: {
        'any.empty': 'Enter a valid postcode',
        'any.required': 'Enter a valid postcode'
      }
    }
  }

  // Overrides parent class getNextPath
  async getNextPath (request) {
    return this.selectAddressLink
  }

  formattedPostcode (postcode = '') {
    return postcode.toUpperCase().replace(/\s/g, '') // Capitalise and remove spaces
  }

  async lookUpAddress (postcode) {
    const address = { postcode: this.formattedPostcode(postcode) }
    if (config.addressLookUpEnabled) {
      const addresses = await addressLookup.lookUpByPostcode(address.postcode)
      const { errorCode, message } = addresses
      if (errorCode) {
        throw new Error(message)
      }
      address.postcodeAddressList = addresses
    } else {
      address.postcodeAddressList = []
    }
    return address
  }

  // Overrides parent class getHandler
  async getHandler (request, h, errors) {
    const address = await this.getAddress(request)
    this.viewData = {
      postcode: address.postcode,
      manualAddressLink: this.manualAddressLink
    }
    return super.getHandler(request, h, errors)
  }

  // Overrides parent class postHandler
  async postHandler (request, h) {
    let address = await this.getAddress(request)
    const postcode = this.formattedPostcode(request.payload.postcode)

    if (postcode !== this.formattedPostcode(address.postcode)) {
      address = await this.lookUpAddress(postcode)
    }

    await this.setAddress(request, address)
    return super.postHandler(request, h)
  }
}

module.exports = AddressFindHandlers
