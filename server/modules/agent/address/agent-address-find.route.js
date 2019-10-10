const { mixin } = require('ivory-shared')
const config = require('../../../config')
class AgentAddressFindHandlers extends mixin(require('ivory-common-modules').address.find.handlers, require('./agent-address-mixin')) {}

const handlers = new AgentAddressFindHandlers(config)

module.exports = handlers.routes({
  path: handlers.findAddressLink,
  app: {
    pageHeading: 'Your address',
    view: 'common/address-find'
    // nextPath is derived in the getNextPath method in the address-find-handler
  }
})
