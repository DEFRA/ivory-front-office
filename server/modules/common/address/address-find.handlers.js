const Joi = require('@hapi/joi')
const addressLookup = require('../../../lib/connectors/address-lookup/addressLookup')
const config = require('../../../config')
const { mixin } = require('ivory-shared')

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
  async getNextPath () {
    return this.selectAddressLink
  }

  formattedPostcode (postcode = '') {
    return postcode.toUpperCase().replace(/\s/g, '') // Capitalise and remove spaces
  }

  async lookUpAddress (postcode) {
    const address = { postcode: this.formattedPostcode(postcode) }
    const addresses = await addressLookup.lookUpByPostcode(address.postcode)
    const { errorCode, message } = addresses
    if (errorCode) {
      throw new Error(message)
    }
    address.postcodeAddressList = addresses
    return address
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    if (!config.addressLookUpEnabled) {
      return h.redirect(this.manualAddressLink)
    }
    const address = await this.getAddress(request)
    this.viewData = {
      postcode: address.postcode,
      manualAddressLink: this.manualAddressLink
    }
    return super.handleGet(request, h, errors)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    let address = await this.getAddress(request)
    const postcode = this.formattedPostcode(request.payload.postcode)

    if (!address.postcodeAddressList || postcode !== this.formattedPostcode(address.postcode)) {
      address = await this.lookUpAddress(postcode)
      if (address.postcodeAddressList.message) {
        // Force an invalid postcode error
        const { error } = Joi.object({ postcode: Joi.required() }).validate({})
        return this.failAction(request, h, error)
      }
    }

    await this.setAddress(request, address)
    return super.handlePost(request, h)
  }
}

module.exports = AddressFindHandlers
