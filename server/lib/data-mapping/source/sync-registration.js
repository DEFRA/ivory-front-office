const { Persistence } = require('../../hapi-utils/index')
const { logger } = require('defra-logging-facade')

class SyncRegistration {
  static set serviceApi (serviceApi) {
    this._serviceApi = serviceApi
  }

  get serviceApi () {
    return this.constructor._serviceApi
  }

  get persistence () {
    return Persistence.createDAO({ path: `${this.serviceApi}/full-registrations` })
  }

  get cache () {
    return require('./cache')
  }

  async save (request) {
    const { Registration, Owner, OwnerAddress, Agent, AgentAddress, Item, Payment } = this.cache
    const registration = await Registration.get(request)
    const owner = await Owner.get(request)
    const ownerAddress = await OwnerAddress.get(request)
    const agent = await Agent.get(request)
    const agentAddress = await AgentAddress.get(request)
    const item = await Item.get(request)
    const payment = await Payment.get(request)

    if (registration) {
      if (owner) {
        if (ownerAddress) {
          owner.address = this._getSavableAddress(ownerAddress)
        }
        registration.owner = owner
      }
      if (agent) {
        if (agentAddress) {
          agent.address = this._getSavableAddress(agentAddress)
        }
        registration.agent = agent
      }
      if (item) {
        registration.item = item
      }
      if (payment) {
        registration.payment = payment
      }

      // Remove the validForPayment flag when saving.  (This is because it's only used to identify whether the registration is complete when loaded
      delete registration.validForPayment

      logger.debug('Saving: ', registration)
      const result = await this.persistence.save(registration)
      if (result.error) {
        logger.error(result)
        throw new Error(result)
      }
      logger.debug('Saved: ', result)
      return this.reloadCache(request, result)
    }
    return false
  }

  async restore (request, id) {
    const registration = await this.persistence.restore(id)
    logger.debug('Retrieved: ', registration)
    return this.reloadCache(request, registration)
  }

  async setPerson (request, person, Person, Address) {
    const { address } = person
    if (address) {
      // Add addressLine and postcodeAddressList back in to the cache if they exist
      const { postcodeAddressList } = await Address.get(request) || {}
      const { businessName = '', addressLine1 = '', addressLine2 = '', town = '', postcode = '' } = address
      const addressLine = [businessName, addressLine1, addressLine2, town, postcode]
        .filter((lineItem) => lineItem)
        .join(', ')
      if (addressLine) {
        address.addressLine = addressLine
      }
      if (postcodeAddressList) {
        address.postcodeAddressList = postcodeAddressList
      }
      await Address.set(request, address, false)
      delete person.address
    } else {
      await Address.set(request, undefined, false)
    }
    await Person.set(request, person, false)
  }

  async reloadCache (request, registration) {
    const { Registration, Owner, OwnerAddress, Agent, AgentAddress, Item, Payment } = this.cache
    const { owner, agent, item, payment } = registration

    if (owner) {
      await this.setPerson(request, owner, Owner, OwnerAddress)
      delete registration.owner
    } else {
      await Owner.set(request, undefined, false)
      await OwnerAddress.set(request, undefined, false)
    }

    if (agent) {
      await this.setPerson(request, agent, Agent, AgentAddress)
      delete registration.agent
    } else {
      await Agent.set(request, undefined, false)
      await AgentAddress.set(request, undefined, false)
    }

    if (item) {
      await Item.set(request, item, false)
      delete registration.item
    } else {
      await Item.set(request, undefined, false)
    }

    if (payment) {
      await Payment.set(request, payment, false)
      delete registration.payment
    } else {
      await Payment.set(request, undefined, false)
    }

    await Registration.set(request, registration, false)
    return true
  }

  _getSavableAddress (address) {
    const { id, postcode, businessName, addressLine1, addressLine2, town, county, country, uprn } = address
    address = { id, postcode, businessName, addressLine1, addressLine2, town, county, country, uprn }
    Object.entries(address).forEach(([prop, val]) => {
      if (val === undefined) {
        delete address[prop]
      }
    })
    return address
  }
}

module.exports = SyncRegistration
