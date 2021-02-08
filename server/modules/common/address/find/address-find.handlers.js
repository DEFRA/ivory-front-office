const Joi = require('@hapi/joi')
const defraHapiUtils = require('../../../../lib/hapi-utils/index')
const config = require('../../../../config')
const AddressLookUp = defraHapiUtils.AddressLookUp

class AddressFindHandlers extends require('../../../../lib/handlers/handlers') {
  get lookUpOptions () {
    const {
      addressLookUpUri: uri,
      addressLookUpUsername: username,
      addressLookUpPassword: password,
      addressLookUpKey: key
    } = config

    return { uri, username, password, key, maxresults: 100 }
  }

  get lookUpEnabled () {
    const { addressLookUpEnabled = false } = config
    return addressLookUpEnabled
  }

  get maxPostcodeLength () {
    return 8
  }

  get schema () {
    return Joi.object({
      postcode: Joi.string().trim().uppercase().max(this.maxPostcodeLength).regex(/^[a-z0-9\s]+$/i).required()
    })
  }

  get errorMessages () {
    return {
      postcode: {
        'any.required': 'Enter postcode',
        'string.empty': 'Enter postcode',
        'string.regex.base': 'Postcode must be valid',
        'string.max': `Postcode must be ${this.maxPostcodeLength} characters or fewer`
      }
    }
  }

  formattedPostcode (postcode = '') {
    return postcode.toUpperCase().replace(/\s/g, '') // Capitalise and remove spaces
  }

  async lookUpAddress (postcode) {
    const address = { postcode }
    const addressLookup = new AddressLookUp(this.lookUpOptions)
    const addresses = await addressLookup.lookUpByPostcode(this.formattedPostcode(postcode))
    const { errorCode, message } = addresses
    if (errorCode) {
      throw new Error(message)
    }
    address.postcodeAddressList = addresses
    return address
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { Address } = this
    const manualAddressLink = await this.manualAddressLink()
    if (!this.lookUpEnabled) {
      return h.redirect(manualAddressLink)
    }
    const address = await Address.get(request) || {}
    this.viewData = {
      postcode: address.postcode,
      manualAddressLink
    }
    return super.handleGet(request, h, errors)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const { Address } = this
    let address = await Address.get(request) || {}
    const postcode = request.payload.postcode

    if (!address.postcodeAddressList || this.formattedPostcode(postcode) !== this.formattedPostcode(address.postcode)) {
      address = await this.lookUpAddress(postcode, config)
      if (address.postcodeAddressList.message) {
        // Force an invalid postcode error
        const { error } = Joi.object({ postcode: Joi.required() }).validate({})
        return this.failAction(request, h, error)
      }
    }

    await Address.set(request, address, false)
    return super.handlePost(request, h)
  }
}

module.exports = AddressFindHandlers
