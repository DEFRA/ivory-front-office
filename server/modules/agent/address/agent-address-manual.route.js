const { mixin } = require('ivory-shared')
class AgentAddressManualHandlers extends mixin(require('../../common/address/address-manual.handlers'), require('./agent-address-mixin')) {}

const handlers = new AgentAddressManualHandlers()

module.exports = handlers.routes({
  path: handlers.manualAddressLink,
  app: {
    pageHeading: 'Your address',
    view: 'common/address/address-manual',
    nextPath: '/owner-name'
  }
})
