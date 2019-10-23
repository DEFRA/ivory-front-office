const Boom = require('@hapi/boom')
const { utils, Payment: PaymentAPI } = require('ivory-shared')
const cache = require('../../lib/cache')
const { Payment, Registration } = cache
const { paymentUrl, paymentKey } = require('../../config')
const { getRoutes } = require('../../flow')

class CheckPaymentHandlers extends require('ivory-common-modules').handlers {
  async handleGet (request, h) {
    await cache.restore(request, request.params.id)
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

const routes = getRoutes.bind(handlers)('check-payment')

module.exports = handlers.routes(routes)
