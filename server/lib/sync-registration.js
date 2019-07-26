const Persistence = require('./persistence')
const persistence = new Persistence({ path: '/full-registrations' })
const { getCache } = require('./utils')

module.exports = {
  async save (request) {
    const [registration, owner, agent, ownerAddress, agentAddress, item] =
      await getCache(request, ['registration', 'owner', 'agent', 'owner-address', 'agent-address', 'item'])
    if (owner) {
      if (ownerAddress) {
        owner.address = ownerAddress
      }
      registration.owner = owner
    }
    if (agent) {
      if (agentAddress) {
        agent.address = agentAddress
      }
      registration.agent = agent
    }
    if (item) {
      registration.item = item
    }
    return persistence.save(registration)
  }
}
