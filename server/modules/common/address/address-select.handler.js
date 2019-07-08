const Joi = require('@hapi/joi')
const chooseAddressHint = 'Choose an address'

class AddressSelectHandlers extends require('../handlers') {
  get schema () {
    return {
      'address': Joi.string().min(1)
    }
  }

  get errorMessages () {
    return {
      'address': {
        'string.min': 'Select an address'
      }
    }
  }

  // Overrides parent class getHandler
  async getHandler (request, h, errors) {
    const address = await this.getAddress(request)
    const { postcodeAddressList = [] } = address

    // Use the payload in this special case to force the addresses to be displayed even when there is an error
    request.payload = {
      chooseAddressHint,
      addresses: [{ text: `${postcodeAddressList.length} addresses found` }].concat(postcodeAddressList.map(({ addressLine, uprn }) => {
        return {
          value: uprn,
          text: addressLine,
          selected: uprn === address.uprn
        }
      })),
      manualAddressLink: this.manualAddressLink
    }

    return super.getHandler(request, h, errors)
  }

  // Overrides parent class postHandler
  async postHandler (request, h) {
    const address = await this.getAddress(request)
    const selectedUprn = request.payload.address

    // Retrieve the actual address information from the cached address list
    Object.assign(address, address.postcodeAddressList.find(({ uprn }) => uprn === selectedUprn))
    await this.setAddress(request, address)

    return super.postHandler(request, h)
  }
}

module.exports = AddressSelectHandlers
