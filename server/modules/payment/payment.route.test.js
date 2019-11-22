const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const { Payment } = require('defra-hapi-utils')
const config = require('../../config')
const { uuid } = require('defra-hapi-utils').utils
const url = '/payment'
const testdomain = 'http://fake-ivory.com'

lab.experiment(TestHelper.getFile(__filename), () => {
  let returnUrl
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename, {
    stubCallback: ({ context }) => {
      const { sandbox } = context
      sandbox.stub(config, 'serviceUrl').value(testdomain)
      sandbox.stub(config, 'paymentEnabled').value(true)
      sandbox.stub(config, 'paymentUrl').value('http://fake.com')
      sandbox.stub(config, 'paymentAmount').value(10)
      sandbox.stub(config, 'paymentKey').value('key')
      sandbox.stub(Payment.prototype, 'requestPayment').value(() => {
        return {
          state: {
            status: 'created'
          },
          _links: {
            next_url: {
              href: returnUrl
            }
          }
        }
      })
    }
  })

  const registrationId = uuid()

  lab.experiment(`GET ${url}`, () => {
    lab.test('route works', async ({ context }) => {
      TestHelper.setCache(context, 'Registration', { id: registrationId, registrationNumber: 'abc' })
      context.request = {
        method: 'GET',
        url
      }

      returnUrl = `${testdomain}/check-payment/${registrationId}`

      await routesHelper.expectRedirection(context, returnUrl)
    })
  })
})
