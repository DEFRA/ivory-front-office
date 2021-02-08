const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const TestHelper = require('../test-helper')
const AddressLookUp = require('./addressLookUp')
const wreck = require('@hapi/wreck')

const address = {
  AddressLine: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
  SubBuildingName: 'ENVIRONMENT AGENCY',
  BuildingName: 'HORIZON HOUSE',
  Street: 'DEANERY ROAD',
  Town: 'BRISTOL',
  County: 'BRISTOL CITY',
  Postcode: 'BS1 5AH',
  Country: 'ENGLAND',
  UPRN: '340116'
}

const lookUpResults = (results) => {
  return {
    results: results.map((result) => {
      return { Address: result }
    })
  }
}

lab.experiment(TestHelper.getFile(__filename), () => {
  let sandbox
  let requestArgs
  let requestMethod

  lab.beforeEach(() => {
    requestMethod = async (...args) => { requestArgs = args }

    // Stub methods
    sandbox = sinon.createSandbox()
    TestHelper.stubCommon(sandbox)
    sandbox.stub(wreck, 'request').value(async (...args) => requestMethod(...args))
  })

  lab.afterEach(async () => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('lookUpByPostcode', () => {
    const config = {
      uri: 'http://uri.com',
      username: 'USERNAME',
      password: 'PASSWORD',
      key: 'KEY',
      maxresults: 10
    }

    const postcode = 'POSTCODE'

    let lookupResponse

    lab.beforeEach(({ context }) => {
      context.expectedResults = [{
        addressLine: address.AddressLine,
        businessName: address.SubBuildingName,
        addressLine1: address.BuildingName,
        addressLine2: address.Street,
        town: address.Town,
        county: address.County,
        postcode: address.Postcode,
        country: address.Country,
        uprn: address.UPRN
      }]
      lookupResponse = lookUpResults([address])
      sandbox.stub(wreck, 'read').value(async () => lookupResponse)
    })

    lab.test('when matching addresses are found', async ({ context }) => {
      const addressLookUp = new AddressLookUp(config)
      const result = await addressLookUp.lookUpByPostcode(postcode)
      Code.expect(result).to.equal(context.expectedResults)

      // Now check request was called with the correct arguments
      const [method, url] = requestArgs
      Code.expect(method).to.equal('POST')
      Code.expect(url).to.endWith(config.uri)
    })

    lab.test('lookUpByPostcode when no addresses matching the postcode are found', async () => {
      lookupResponse = { error: { message: '(999) - Error message results, Code 999: Some unknown error from the Address Server, Code 999: No Match Found.' } }
      const addressLookUp = new AddressLookUp(config)
      const result = await addressLookUp.lookUpByPostcode('WA41AB')
      Code.expect(result.errorCode).to.equal('999')
    })

    lab.test('lookUpByPostcode when no addresses matching the postcode are found', async () => {
      lookupResponse = { error: { message: '(204) - Error message results, Code 204: No results returned from Address Server, Code 204: No Match Found.' } }
      const addressLookUp = new AddressLookUp(config)
      const result = await addressLookUp.lookUpByPostcode('WA41AB')
      Code.expect(result.length).to.equal(0)
    })

    lab.test('when config is invalid', async () => {
      let error
      let addressLookUp
      try {
        addressLookUp = new AddressLookUp({})
      } catch (err) {
        error = err
      }
      Code.expect(addressLookUp).to.equal(undefined)
      Code.expect(error).to.equal(new Error('The address look up config is invalid. "uri" is required. "username" is required. "password" is required. "key" is required'))
    })

    lab.test('when request throws an error', async () => {
      // Override stubbed request method
      const testError = new Error('test error')
      requestMethod = () => {
        throw testError
      }

      const addressLookUp = new AddressLookUp(config)
      let error
      try {
        await addressLookUp.lookUpByPostcode(postcode)
      } catch (err) {
        error = err
      }
      Code.expect(error).to.equal(testError)
    })
  })
})
