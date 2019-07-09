const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const { logger } = require('defra-logging-facade')
const addressLookup = require('../../../lib/connectors/address-lookup/addressLookup')
const config = require('../../../config')
const wreck = require('@hapi/wreck')

lab.experiment('Test Base Handlers', () => {
  let lookupResponse
  let sandbox

  lab.beforeEach(() => {
    // Stub methods
    sandbox = sinon.createSandbox()
    sandbox.stub(logger, 'info').value(() => undefined)
    sandbox.stub(config, 'airbrakeEnabled').value(() => false)
    sandbox.stub(config, 'redisEnabled').value(() => false)
    sandbox.stub(wreck, 'request').value(() => undefined)
    sandbox.stub(wreck, 'read').value(() => lookupResponse)
  })

  lab.afterEach(async () => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.test('lookUpByPostcode when no addresses matching the postcode are found', async () => {
    lookupResponse = { error: { message: '(999) - Error message results, Code 999: Some unknown error from the Address Server, Code 999: No Match Found.' } }
    const addresses = await addressLookup.lookUpByPostcode('WA41AB')
    Code.expect(addresses.errorCode).to.equal('999')
  })

  lab.test('lookUpByPostcode when no addresses matching the postcode are found', async () => {
    lookupResponse = { error: { message: '(204) - Error message results, Code 204: No results returned from Address Server, Code 204: No Match Found.' } }
    const addresses = await addressLookup.lookUpByPostcode('WA41AB')
    Code.expect(addresses.length).to.equal(0)
  })

  lab.test('lookUpByPostcode when addresses matching the postcode are found', async () => {
    lookupResponse = require('./addressLookupResponseExample.json')
    const addresses = await addressLookup.lookUpByPostcode('WA41AB')
    Code.expect(addresses.length).to.equal(2)
  })
})
