const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const SelectOneOptionHandlers = require('../common/option/select-one-option.handlers')
const url = '/who-owns-item'
const pageHeading = 'Who owns the item?'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: (sandbox) => {
      sandbox.stub(SelectOneOptionHandlers.prototype, 'referenceData').value({
        choices: [
          { shortName: 'agent', value: true },
          { shortName: 'someone-else', value: false }
        ]
      })
    }
  })

  routesHelper.getRequestTests({ lab, pageHeading, url })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when who owns the item has not been selected', async ({ context }) => {
      const { request } = context
      return routesHelper.expectValidationErrors(request, [
        { field: 'agentIsOwner', message: 'Select who owns the item' }
      ])
    })

    lab.test('redirects correctly when "I own it" is selected', async ({ context }) => {
      const { request } = context
      request.payload.agentIsOwner = 'agent'
      await routesHelper.expectRedirection(request, '/owner-name')
      Code.expect(routesHelper.cache.registration.agentIsOwner).to.equal(true)
    })

    lab.test('redirects correctly when "someone else" is selected', async ({ context }) => {
      const { request } = context
      request.payload.agentIsOwner = 'someone-else'
      await routesHelper.expectRedirection(request, '/agent')
      Code.expect(routesHelper.cache.registration.agentIsOwner).to.equal(false)
    })
  })
})
