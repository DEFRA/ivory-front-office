const mixin = require('../../../lib/mixin')
class AgentAddressSelectHandlers extends mixin(require('../../common/address/address-select.handlers'), require('./agent-address-mixin')) {}

const handlers = new AgentAddressSelectHandlers()

module.exports = handlers.routes({
  path: handlers.selectAddressLink,
  app: {
    pageHeading: 'Your address',
    view: 'common/address/address-select',
    nextPath: '/owner-name'
  }
})
