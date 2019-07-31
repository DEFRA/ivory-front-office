const Joi = require('@hapi/joi')
const mixin = require('../../../lib/mixin')

class AddressManualHandlers extends mixin(require('../handlers'), require('./address-mixin')) {
  get schema () {
    return Joi.object({
      'address-line-1': Joi.string().required(),
      'address-line-2': Joi.any(),
      'address-town': Joi.string().required(),
      'address-county': Joi.any(),
      'address-postcode': Joi.string().required()
    })
  }

  get errorMessages () {
    return {
      'address-line-1': { 'any.empty': 'Enter a valid building number or name' },
      'address-town': { 'any.empty': 'Enter a valid town' },
      'address-postcode': { 'any.empty': 'Enter a valid postcode' }
    }
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const address = request.payload || await this.getAddress(request)
    address.addressLine1 = address.subBuildingName || address.buildingNumber
    this.viewData = {
      address,
      findAddressLink: this.findAddressLink
    }
    return super.handleGet(request, h, errors)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const address = await this.getAddress(request)
    const {
      'address-line-1': addressLine1,
      'address-line-2': street,
      'address-town': town,
      'address-county': county,
      'address-postcode': postcode
    } = request.payload

    Object.assign(address, { street, town, county, postcode })

    address.addressLine = `${addressLine1}, ${street}, ${town}, ${postcode}`

    if (addressLine1.trim().match(/^\d+/)) {
      address.buildingNumber = addressLine1
    } else {
      address.subBuildingName = addressLine1
    }

    await this.setAddress(request, address, true)
    return super.handlePost(request, h)
  }
}

module.exports = AddressManualHandlers
