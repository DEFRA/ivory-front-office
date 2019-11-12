const { utils, Payment: PaymentAPI } = require('ivory-shared')
const { logger } = require('defra-logging-facade')
const { Registration, Payment } = require('ivory-data-mapping').cache
const { serviceName, serviceUrl, paymentEnabled, paymentUrl, paymentAmount, paymentKey } = require('../../config')
const { getRoutes } = require('../../flow')

class PaymentHandlers extends require('ivory-common-modules').handlers {
  async handleGet (request, h, errors) {
    const registration = await Registration.get(request) || {}

    if (!paymentEnabled) {
      logger.warn('Payments have been disabled!')
      return h.redirect('/confirmation-notify')
    }

    const payment = new PaymentAPI({
      paymentsUrl: paymentUrl,
      apiKey: paymentKey,
      amount: paymentAmount, // in pence
      reference: registration.registrationNumber || 'unknown',
      description: serviceName,
      returnUrl: `${serviceUrl}/check-payment/${registration.id}`
    })

    const result = await payment.requestPayment()
    const status = utils.getNestedVal(result, 'state.status')
    if (status === 'created') {
      const { amount, description, reference, payment_id: paymentId, payment_provider: paymentProvider, created_date: createdDate } = result
      const payment = { amount, description, reference, paymentId, paymentProvider, status, createdDate }
      await Payment.set(request, payment)
      return h.redirect(result._links.next_url.href)
    }
  }

  paymentEnabled () {
    return paymentEnabled
  }
}

const handlers = new PaymentHandlers()

const routes = getRoutes.bind(handlers)('payment')

module.exports = handlers.routes(routes).filter(({ method }) => method === 'GET')
