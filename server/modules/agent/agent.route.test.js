const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const SelectOneOptionHandlers = require('../common/option/select-one-option.handlers')
const pageHeading = 'How are you acting on behalf of the owner?'
const url = '/agent'

lab.experiment(TestHelper.getFile(__filename), () => {
  const testHelper = new TestHelper(lab, __filename, {
    stubCallback: (sandbox) => {
      sandbox.stub(SelectOneOptionHandlers.prototype, 'referenceData').value({
        choices: [
          { shortName: 'executor', value: 'executor' },
          { shortName: 'trustee', value: 'trustee' }
        ]
      })
    }
  })

  testHelper.getRequestTests({ lab, pageHeading, url })

  testHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when nothing is selected', async ({ context }) => {
      const { request } = context
      return testHelper.expectValidationErrors(request, [
        { field: 'agentActingAs', message: 'Select how you are acting on behalf of the owner' }
      ])
    })

    lab.test('redirects correctly when "Executor" is selected', async ({ context }) => {
      const { request } = context
      request.payload.agentActingAs = 'executor'
      await testHelper.expectRedirection(request, '/agent-name')
      Code.expect(testHelper.cache.registration.agentActingAs).to.equal('executor')
    })

    lab.test('redirects correctly when "Trustee" is selected', async ({ context }) => {
      const { request } = context
      request.payload.agentActingAs = 'trustee'
      await testHelper.expectRedirection(request, '/agent-name')
      Code.expect(testHelper.cache.registration.agentActingAs).to.equal('trustee')
    })
  })
})
