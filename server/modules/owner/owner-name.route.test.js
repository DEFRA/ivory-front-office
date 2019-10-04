const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const url = '/owner-name'
const pageHeading = 'Owner\'s name'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.test('page heading is correct when no agent', async ({ context }) => {
      const { request, server } = context
      TestHelper.setCache(context, 'Registration', { ownerType: 'agent' })
      const response = await server.inject(request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('h1').text().trim()).to.equal('Your name')
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
      TestHelper.setCache(context, 'Owner', { fullName: 'James Bond' })
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
        { field: 'full-name', message: 'Enter owner\'s full name' }
      ])
    })

    lab.test('fails validation when the full name only contains spaces and the agent is the owner', async ({ context }) => {
      const { request } = context
      request.payload['full-name'] = ' '
      TestHelper.setCache(context, 'Registration', { ownerType: 'agent' })
      return routesHelper.expectValidationErrors(context, [
        { field: 'full-name', message: 'Enter your full name' }
      ])
    })

    lab.test('redirects correctly when the full name has been entered', async ({ context }) => {
      const { request } = context
      const fullName = 'James Bond'
      request.payload['full-name'] = fullName
      await routesHelper.expectRedirection(context, '/owner-full-address')
      Code.expect(TestHelper.getCache(context, 'Owner').fullName).to.equal(fullName)
    })
  })
})
