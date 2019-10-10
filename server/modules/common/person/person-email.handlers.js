const Joi = require('@hapi/joi')

class PersonEmailHandlers extends require('ivory-common-modules').handlers {
  get maxEmailAddressLength () {
    return 320
  }

  get schema () {
    return Joi.object({
      email: Joi.string().trim().email().max(this.maxEmailAddressLength).required()
    })
  }

  get errorMessages () {
    return {
      email: {
        'any.empty': 'Enter an email address in the correct format, like name@example.com',
        'string.email': 'Enter an email address in the correct format, like name@example.com',
        'string.max': `Enter an email address in ${this.maxEmailAddressLength} characters or less`
      }
    }
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { Person } = this
    const { email } = await Person.get(request) || {}
    const emailHint = this.getEmailHint && await this.getEmailHint(request)
    this.viewData = { email, emailHint }
    return super.handleGet(request, h, errors)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const { Person } = this
    const person = await Person.get(request) || {}
    person.email = request.payload.email
    await Person.set(request, person)
    return super.handlePost(request, h)
  }
}

module.exports = PersonEmailHandlers
