
const { utils, Persistence } = require('ivory-shared')
const { serviceApi } = require('../config')
const persistence = new Persistence({ path: '/full-registrations', serviceApi })
const { logger } = require('defra-logging-facade')

const syncRegistration = {
  async save (request) {
    const [registration, owner, agent, ownerAddress, agentAddress, item] =
      await utils.getCache(request, [
        'registration',
        'owner',
        'agent',
        'owner-address',
        'agent-address',
        'item'])
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

  async setPerson (request, person, type, addressType) {
    const { address } = person
    if (address) {
      // Add addressLine and postcodeAddressList back in to the cache if they exist
      const { addressLine, postcodeAddressList } = await utils.getCache(request, addressType) || {}
      if (addressLine) {
        address.addressLine = addressLine
      }
      if (postcodeAddressList) {
        address.postcodeAddressList = postcodeAddressList
      }
      await utils.setCache(request, addressType, address)
      delete person.address
    }
    await utils.setCache(request, type, person)
  },

  async reloadCache (request, registration) {
    const { owner, agent, item } = registration

    if (owner) {
      await this.setPerson(request, owner, 'owner', 'owner-address')
      delete registration.owner
    }

    if (agent) {
      await this.setPerson(request, agent, 'agent', 'agent-address')
      delete registration.agent
    }

    if (item) {
      await utils.setCache(request, 'item', item)
      delete registration.item
    }

    await utils.setCache(request, 'registration', registration)
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
