const { logger } = require('defra-logging-facade')
const Boom = require('@hapi/boom')
const { Registration, Agent, Owner } = require('../../lib/cache')
const { notifyEnabled, notifyApiKey, notifyConfirmationTemplateId, notifyEmailReplyToId } = require('../../config')

const NotifyClient = require('notifications-node-client').NotifyClient

class ConfirmationHandlers extends require('../common/handlers') {
  async notifyRegistration (contact, registrationNumber) {
    const { fullName, email: emailAddress } = contact || {}
    const reference = registrationNumber + Date.now()
    const personalisation = {
      registrationNumber,
      fullName
    }
    const emailReplyToId = notifyEmailReplyToId
    const notifyClient = new NotifyClient(notifyApiKey)
    try {
      return await notifyClient
        .sendEmail(notifyConfirmationTemplateId, emailAddress, {
          // email_address: emailAddress,
          personalisation,
          reference,
          emailReplyToId
        })
    } catch (err) {
      return err
    }
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const [registration, agent, owner] = await Promise.all([
      Registration.get(request),
      Agent.get(request),
      Owner.get(request)
    ])
    const contact = agent || owner
    const { registrationNumber } = registration || {}
    if (notifyEnabled) {
      const result = await this.notifyRegistration(contact, registrationNumber)
      if (result.error) {
        logger.error(result.error)
        return Boom.boomify(result.error.errors.pop)
      }
    }
    return h.redirect('/confirmation')
  }
}

const handlers = new ConfirmationHandlers()

module.exports = handlers.routes({
  path: '/confirmation-notify',
  app: {
    tags: ['submitted']
  }
})
