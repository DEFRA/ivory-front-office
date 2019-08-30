
const { Persistence } = require('ivory-shared')
const { serviceApi } = require('../config')
const persistence = new Persistence({ path: `${serviceApi}/full-registrations` })
const { logger } = require('defra-logging-facade')

function getCache () {
  // This is to prevent a recursive require loop as the cache requires this file
  return require('./cache')
}

const syncRegistration = {
  async save (request) {
    const { Registration, Owner, OwnerAddress, Agent, AgentAddress, Item } = getCache()
    const registration = await Registration.get(request)
    const owner = await Owner.get(request)
    const ownerAddress = await OwnerAddress.get(request)
    const agent = await Agent.get(request)
    const agentAddress = await AgentAddress.get(request)
    const item = await Item.get(request)

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
      const { addressLine, postcodeAddressList } = await Address.get(request) || {}
      if (addressLine) {
        address.addressLine = addressLine
      }
      if (postcodeAddressList) {
        address.postcodeAddressList = postcodeAddressList
      }
      await Address.set(request, address)
      delete person.address
    }
    await Person.set(request, person)
  },

  async reloadCache (request, registration) {
    const { Registration, Owner, OwnerAddress, Agent, AgentAddress, Item } = getCache()
    const { owner, agent, item } = registration

    if (owner) {
      await this.setPerson(request, owner, Owner, OwnerAddress)
      delete registration.owner
    }

    if (agent) {
      await this.setPerson(request, agent, Agent, AgentAddress)
      delete registration.agent
    }

    if (item) {
      await Item.set(request, item)
      delete registration.item
    }

    await Registration.set(request, registration)
    return true
  },

  _getSavableAddress (address) {
    const { id, postcode, addressLine1, addressLine2, town, county, country, uprn } = address
    address = { id, postcode, addressLine1, addressLine2, town, county, country, uprn }
    Object.entries(address).forEach(([prop, val]) => {
      if (val === undefined) {
        delete address[prop]
      }
    })
    return address
  }
}

module.exports = syncRegistration
