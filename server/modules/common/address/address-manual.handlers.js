const Joi = require('@hapi/joi')
const syncRegistration = require('../../../lib/sync-registration')

class AddressManualHandlers extends require('../handlers') {
  get schema () {
    return Joi.object({
      'address-line-1': Joi.string().trim().required(),
      'address-line-2': Joi.string().allow('').trim(),
      'address-town': Joi.string().trim().required(),
      'address-county': Joi.string().allow('').trim(),
      'address-postcode': Joi.string().trim().required()
    })
  }

  get errorMessages () {
    return {
      'address-line-1': { 'any.empty': 'Enter a valid building and street' },
      'address-town': { 'any.empty': 'Enter a valid town or city' },
      'address-postcode': { 'any.empty': 'Enter a valid postcode' }
    }
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { Address } = this
    const address = await Address.get(request) || {}
    this.viewData = {
      'address-line-1': address.addressLine1,
      'address-line-2': address.addressLine2,
      'address-town': address.town,
      'address-county': address.county,
      'address-postcode': address.postcode,
      findAddressLink: this.findAddressLink
    }
    return super.handleGet(request, h, errors)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const { Address } = this
    const address = await Address.get(request) || {}
    const {
      'address-line-1': addressLine1,
      'address-line-2': addressLine2,
      'address-town': town,
      'address-county': county,
      'address-postcode': postcode
    } = request.payload

    Object.assign(address, { addressLine1, addressLine2, town, county, postcode })

    address.addressLine = `${addressLine1}, ${addressLine2}, ${town}, ${postcode}`

    await Address.set(request, address, syncRegistration)
    return super.handlePost(request, h)
  }
}

module.exports = AddressManualHandlers
