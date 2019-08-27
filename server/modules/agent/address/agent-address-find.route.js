const { mixin } = require('ivory-shared')
class AgentAddressFindHandlers extends mixin(require('../../common/address/address-find.handlers'), require('./agent-address-mixin')) {}

const handlers = new AgentAddressFindHandlers()

module.exports = handlers.routes({
  path: handlers.findAddressLink,
  app: {
    pageHeading: 'Your address',
    view: 'common/address/address-find'
    // nextPath is derived in the getNextPath method in the address-find-handler
  }
})
