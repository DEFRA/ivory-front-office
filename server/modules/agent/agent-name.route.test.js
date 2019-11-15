const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const config = require('../../config')
const url = '/agent-name'
const pageHeading = 'Contact name'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.beforeEach(({ context }) => {
      const { sandbox } = context
      sandbox.stub(config, 'addressLookUpEnabled').get(() => false)
    })

    lab.test('full name has not been pre-filled', async ({ context }) => {
      const { request, server } = context
      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#full-name').val()).to.not.exist()
    })

    lab.test('full name has been pre-filled', async ({ context }) => {
      const { request, server } = context
      const fullName = 'James Bond'
      TestHelper.setCache(context, 'Agent', { fullName })
      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('#full-name').val()).to.equal(fullName)
    })
  })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when the full name has not been entered', async ({ context }) => {
      const { request } = context
      request.payload['full-name'] = ''
      return routesHelper.expectValidationErrors(context, [
        { field: 'full-name', message: 'Enter your full name' }
      ])
    })

    lab.test('redirects correctly when the full name has been entered', async ({ context }) => {
      const { request } = context
      const fullName = 'James Bond'
      request.payload['full-name'] = fullName
      await routesHelper.expectRedirection(context, '/agent-address-full')
      Code.expect(TestHelper.getCache(context, 'Agent').fullName).to.equal(fullName)
    })
  })
})
