const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const SelectOneOptionHandlers = require('../common/option/select-one-option.handlers')
const pageHeading = 'How are you acting on behalf of the owner?'
const url = '/agent'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: (sandbox) => {
      sandbox.stub(SelectOneOptionHandlers.prototype, 'referenceData').value({
        choices: [
          { shortName: 'executor', value: 'executor' },
          { shortName: 'trustee', value: 'trustee' }
        ]
      })
    }
  })

  routesHelper.getRequestTests({ lab, pageHeading, url })

  routesHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when nothing is selected', async ({ context }) => {
      const { request } = context
      return routesHelper.expectValidationErrors(request, [
        { field: 'agentActingAs', message: 'Select how you are acting on behalf of the owner' }
      ])
    })

    lab.test('redirects correctly when "Executor" is selected', async ({ context }) => {
      const { request } = context
      request.payload.agentActingAs = 'executor'
      await routesHelper.expectRedirection(request, '/agent-name')
      Code.expect(routesHelper.cache.Registration.agentActingAs).to.equal('executor')
    })

    lab.test('redirects correctly when "Trustee" is selected', async ({ context }) => {
      const { request } = context
      request.payload.agentActingAs = 'trustee'
      await routesHelper.expectRedirection(request, '/agent-name')
      Code.expect(routesHelper.cache.Registration.agentActingAs).to.equal('trustee')
    })
  })
})
