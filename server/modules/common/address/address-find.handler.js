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

  // Overrides parent class getNextPath
  async getNextPath (request) {
    const { postcodeAddressList } = await this.getAddress(request)
    if (postcodeAddressList.length) {
      return this.selectAddressLink
    } else {
      return this.manualAddressLink
    }
  }

  formattedPostcode (postcode = '') {
    return postcode.toUpperCase().replace(/\s/g, '') // Capitalise and remove spaces
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
      // Clear address leaving only the new postcode
      address = { postcode: this.formattedPostcode(postcode) }
      let addresses = await addressLookup.lookUpByPostcode(address.postcode)
      const { errorCode, message } = addresses
      if (errorCode) {
        throw new Error(message)
      }
      address.postcodeAddressList = addresses
    }

    await this.setAddress(request, address)
    return super.postHandler(request, h)
  }
}

module.exports = AddressFindHandlers
