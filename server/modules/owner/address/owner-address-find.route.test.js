const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../../test-helper')
const FindAddressHandlers = require('ivory-common-modules').address.find.handlers
const config = require('../../../config')
const url = '/owner-address'
const pageHeading = 'Owner\'s address'

lab.experiment(TestHelper.getFile(__filename), () => {
  let postcodeAddressList
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: ({ context }) => {
      const { sandbox } = context
      sandbox.stub(config, 'addressLookUpEnabled').value(true)
      sandbox.stub(config, 'addressLookUpUri').value('http://fake.com')
      sandbox.stub(config, 'addressLookUpUsername').value('username')
      sandbox.stub(config, 'addressLookUpPassword').value('password')
      sandbox.stub(config, 'addressLookUpKey').value('key')
    }
  })

  lab.beforeEach(({ context }) => {
    const { sandbox } = context
    postcodeAddressList = []
    sandbox.stub(FindAddressHandlers.prototype, 'lookUpAddress').value((postcode) => {
      const address = { postcode, postcodeAddressList }
      if (postcode === 'WA41AB') {
        // Contains an address
        address.postcodeAddressList.push({ postcode })
      }
      return address
    })
  })

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('page heading is correct when no agent', async ({ context }) => {
      const { request, server } = context
      TestHelper.setCache(context, 'Registration', { ownerType: 'agent' })
      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('h1').text().trim()).to.equal('Your address')
    })

    lab.test('postcode has not been pre-filled', async ({ context }) => {
      const { request, server } = context
      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#postcode').val()).to.not.exist()
    })

    lab.test('postcode has been pre-filled', async ({ context }) => {
      const { request, server } = context
      const postcode = 'WC1A 1AA'
      TestHelper.setCache(context, 'OwnerAddress', { postcode })
      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#postcode').val()).to.equal(postcode)
    })

    lab.test('redirects to manual address', async ({ context }) => {
      const { sandbox } = context
      sandbox.stub(FindAddressHandlers.prototype, 'lookUpEnabled').get(() => false)
      await routesHelper.expectRedirection(context, '/owner-full-address')
    })
  })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when the postcode has not been entered', async ({ context }) => {
      return routesHelper.expectValidationErrors(context, [
        { field: 'postcode', message: 'Enter a valid postcode' }
      ])
    })

    lab.test('fails validation when the postcode lookup returns a message without an error', async ({ context }) => {
      const { request } = context
      request.payload.postcode = 'WA41A'
      postcodeAddressList = { message: 'No postcode found' }
      return routesHelper.expectValidationErrors(context, [
        { field: 'postcode', message: 'Enter a valid postcode' }
      ])
    })

    lab.test('redirects to select address correctly when a postcode has been entered that has addresses', async ({ context }) => {
      const { request } = context
      const postcode = 'WA41AB'
      request.payload.postcode = postcode
      await routesHelper.expectRedirection(context, '/owner-address-select')
      Code.expect(TestHelper.getCache(context, 'OwnerAddress').postcode).to.equal(postcode)
    })
  })
})
