const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const SelectOneOptionHandlers = require('../common/option/select-one-option.handlers')
const url = '/who-owns-item'
const pageHeading = 'Who owns the item?'

lab.experiment(TestHelper.getFile(__filename), () => {
  const testHelper = new TestHelper(lab, __filename, {
    stubCallback: (sandbox) => {
      sandbox.stub(SelectOneOptionHandlers.prototype, 'referenceData').value({
        choices: [
          { shortName: 'agent', value: true },
          { shortName: 'someone-else', value: false }
        ]
      })
    }
  })

  testHelper.getRequestTests({ lab, pageHeading, url })

  testHelper.postRequestTests({ lab, pageHeading, url }, () => {
    lab.test('fails validation when who owns the item has not been selected', async ({ context }) => {
      const { request } = context
      return testHelper.expectValidationErrors(request, [
        { field: 'agentIsOwner', message: 'Select who owns the item' }
      ])
    })

    lab.test('redirects correctly when "I own it" is selected', async ({ context }) => {
      const { request } = context
      request.payload.agentIsOwner = 'agent'
      await testHelper.expectRedirection(request, '/owner-name')
      Code.expect(testHelper.cache.registration.agentIsOwner).to.equal(true)
    })

    lab.test('redirects correctly when "someone else" is selected', async ({ context }) => {
      const { request } = context
      request.payload.agentIsOwner = 'someone-else'
      await testHelper.expectRedirection(request, '/agent')
      Code.expect(testHelper.cache.registration.agentIsOwner).to.equal(false)
    })
  })
})
