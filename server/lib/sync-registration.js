
const { Persistence } = require('ivory-shared')
const { serviceApi } = require('../config')
const persistence = new Persistence({ path: `${serviceApi}/full-registrations` })
const { logger } = require('defra-logging-facade')
const { Registration, Owner, OwnerAddress, Agent, AgentAddress, Item, Payment } = require('./cache')

const syncRegistration = {
  async save (request) {
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
          owner.address = syncRegistration._getSavableAddress(ownerAddress)
        }
        registration.owner = owner
      }
      if (agent) {
        if (agentAddress) {
          agent.address = syncRegistration._getSavableAddress(agentAddress)
        }
        registration.agent = agent
      }
      if (item) {
        registration.item = item
      }
      if (payment) {
        registration.payment = payment
      }

      logger.debug('Saving: ', registration)
      const result = await persistence.save(registration)
      if (result.error) {
        logger.error(result)
        throw new Error(result)
      }
      logger.debug('Saved: ', result)
      return syncRegistration.reloadCache(request, result)
    }
    return false
  },

  async restore (request, id) {
    const registration = await persistence.restore(id)
    logger.debug('Retrieved: ', registration)
    return syncRegistration.reloadCache(request, registration)
  },

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
    }
    await Person.set(request, person, false)
  },

  async reloadCache (request, registration) {
    const { owner, agent, item, payment } = registration

    if (owner) {
      await this.setPerson(request, owner, Owner, OwnerAddress)
      delete registration.owner
    }

    if (agent) {
      await this.setPerson(request, agent, Agent, AgentAddress)
      delete registration.agent
    }

    if (item) {
      await Item.set(request, item, false)
      delete registration.item
    }

    if (payment) {
      await Payment.set(request, payment, false)
      delete registration.payment
    }

    await Registration.set(request, registration, false)
    return true
  },

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

module.exports = syncRegistration
