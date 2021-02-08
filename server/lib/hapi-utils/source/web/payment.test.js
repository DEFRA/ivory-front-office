const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const TestHelper = require('../test-helper')
const Payment = require('./payment')
const wreck = require('@hapi/wreck')
const paymentsUrl = 'http://fake-payments.com'
const returnUrl = 'http://fake-return.com'

const config = {
  paymentsUrl,
  apiKey: 'api-key',
  amount: 10,
  reference: 'ref',
  description: 'description',
  returnUrl
}

lab.experiment(TestHelper.getFile(__filename), () => {
  let sandbox
  let requestArgs
  let requestMethod
  let expectedResult

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

  lab.experiment('requestPayment', () => {
    lab.beforeEach(() => {
      expectedResult = {
        state: {
          status: 'created'
        },
        _links: {
          next_url: {
            href: returnUrl
          }
        }
      }
      sandbox.stub(wreck, 'read').value(async () => expectedResult)
    })

    lab.test('when payment is successful', async () => {
      const payment = new Payment(config)
      const result = await payment.requestPayment()
      Code.expect(result).to.equal(expectedResult)

      // Now check request was called with the correct arguments
      const [method, url] = requestArgs
      Code.expect(method).to.equal('POST')
      Code.expect(url).to.endWith(config.paymentsUrl)
    })

    lab.test('when payment is unsuccessful', async () => {
      expectedResult = { code: 101, description: 'failure' }
      const payment = new Payment(config)
      const result = await payment.requestPayment()
      Code.expect(result.message).to.equal('101: failure')
    })

    lab.test('when request throws an error', async () => {
      // Override stubbed request method
      const testError = new Error('test error')
      requestMethod = () => {
        throw testError
      }

      const payment = new Payment(config)
      let error
      try {
        await payment.requestPayment()
      } catch (err) {
        error = err
      }
      Code.expect(error).to.equal(testError)
    })
  })

  lab.experiment('requestPayment', () => {
    let paymentId

    lab.beforeEach(() => {
      paymentId = 'my-payment-id'

      expectedResult = {
        state: {
          status: 'created'
        },
        _links: {
          next_url: {
            href: returnUrl
          }
        }
      }

      sandbox.stub(wreck, 'read').value(async () => expectedResult)
    })

    lab.test('when payment status is successful', async () => {
      const payment = new Payment(config)
      const result = await payment.requestStatus(paymentId)
      Code.expect(result).to.equal(expectedResult)

      // Now check request was called with the correct arguments
      const [method, url] = requestArgs
      Code.expect(method).to.equal('GET')
      Code.expect(url).to.endWith(`${config.paymentsUrl}/${paymentId}`)
    })

    lab.test('when payment status is unsuccessful', async () => {
      expectedResult = { code: 101, description: 'failure' }
      const payment = new Payment(config)
      const result = await payment.requestStatus(paymentId)
      Code.expect(result.message).to.equal('101: failure')
    })

    lab.test('when config is invalid', async () => {
      let error
      let payment
      try {
        payment = new Payment({})
      } catch (err) {
        error = err
      }
      Code.expect(payment).to.equal(undefined)
      Code.expect(error).to.equal(new Error('The payment config is invalid. "paymentsUrl" is required. "apiKey" is required'))
    })

    lab.test('when request throws an error', async () => {
      // Override stubbed request method
      const testError = new Error('test error')
      requestMethod = () => {
        throw testError
      }

      const payment = new Payment(config)
      let error
      try {
        await payment.requestStatus(paymentId)
      } catch (err) {
        error = err
      }
      Code.expect(error).to.equal(testError)
    })
  })
})
