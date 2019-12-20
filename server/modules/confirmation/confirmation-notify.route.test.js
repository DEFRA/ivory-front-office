const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const moment = require('moment')
const NotifyClient = require('notifications-node-client').NotifyClient
const TestHelper = require('../../../test-helper')
const config = require('../../config')
const url = '/confirmation-notify'
const testdomain = 'http://fake-ivory.com'

lab.experiment(TestHelper.getFile(__filename), () => {
  let notifyInput
  const registrationNumber = 'abc'
  const timestamp = Date.now()
  const expectedNotifyInput = {
    notifyConfirmationTemplateId: 'NOTIFY-CONFIRMATION-TEMPLATE-ID',
    emailAddress: 'test@test.gov.uk',
    data: {
      personalisation: { registrationNumber, fullName: 'test' },
      reference: `${registrationNumber}${timestamp}`,
      emailReplyToId: 'NOTIFY-EMAIL-REPLY-TO-ID'
    }
  }
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: ({ context }) => {
      const { sandbox } = context
      sandbox.stub(config, 'serviceUrl').value(testdomain)
      sandbox.stub(config, 'notifyEnabled').value(true)
      sandbox.stub(config, 'notifyApiKey').value('NOTIFY-API-KEY')
      sandbox.stub(config, 'notifyConfirmationTemplateId').value(expectedNotifyInput.notifyConfirmationTemplateId)
      sandbox.stub(config, 'notifyEmailReplyToId').value(expectedNotifyInput.data.emailReplyToId)
      sandbox.stub(Date, 'now').value(() => timestamp)
      sandbox.stub(moment.prototype, 'format').value(() => 'Submitted Date')
      sandbox.stub(NotifyClient.prototype, 'sendEmail').value((notifyConfirmationTemplateId, emailAddress, data) => {
        notifyInput = { notifyConfirmationTemplateId, emailAddress, data }
        return {}
      })
    }
  })

  lab.experiment(`GET ${url}`, () => {
    lab.test('route works', async ({ context }) => {
      context.request = {
        method: 'GET',
        url
      }

      const { emailAddress: email } = expectedNotifyInput
      const { registrationNumber, fullName } = expectedNotifyInput.data.personalisation

      TestHelper.setCache(context, 'Registration', { registrationNumber, status: 'submitted' })
      TestHelper.setCache(context, 'Owner', { fullName, email })

      await routesHelper.expectRedirection(context, '/confirmation')
      Code.expect(notifyInput).to.equal(expectedNotifyInput)
      Code.expect(TestHelper.getCache(context, 'Registration')).to.equal({ registrationNumber, status: 'submitted', confirmationSent: true, submittedDate: 'Submitted Date' })
    })
  })
})
