const Boom = require('@hapi/boom')
const { utils, Cache, Payment: PaymentAPI } = require('ivory-shared')
const { Payment, Registration } = require('../../lib/cache')
const { paymentUrl, paymentKey } = require('../../config')
const syncRegistration = require('../../lib/sync-registration')

class CheckPaymentHandlers extends require('../common/handlers') {
  async handleGet (request, h, errors) {
    // Clear the cookies and create a new registration
    await Cache.clear(request)
    const { id } = request.params
    await syncRegistration.restore(request, id)
    const payment = await Payment.get(request)

    const paymentApi = new PaymentAPI({
      paymentsUrl: paymentUrl,
      apiKey: paymentKey
    })

    const result = await paymentApi.requestStatus(payment.paymentId)
    const status = utils.getNestedVal(result, 'state.status') || 'failed'
    payment.status = status

    if (status === 'success') {
      const registration = await Registration.get(request)
      registration.status = 'submitted'
      await Payment.set(request, payment, false)
      await Registration.set(request, registration)
      return h.redirect('/confirmation-notify')
    } else {
      const code = utils.getNestedVal(result, 'state.code')
      const message = utils.getNestedVal(result, 'state.message')
      if (code) {
        payment.code = code
        payment.message = message
        await Payment.set(request, payment)
        return h.redirect('/check-your-answers')
      }
    }

    await Payment.set(request, payment)
    return Boom.expectationFailed('Payment failed', payment)
  }
}

const handlers = new CheckPaymentHandlers()

module.exports = handlers.routes({
  path: '/check-payment/{id}',
  app: {
    tags: ['always']
  }
})
