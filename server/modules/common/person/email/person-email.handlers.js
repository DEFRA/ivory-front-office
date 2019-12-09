const Joi = require('@hapi/joi')

class PersonEmailHandlers extends require('defra-hapi-handlers') {
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
        'any.required': 'Enter an email address in the correct format, like name@example.com',
        'string.empty': 'Enter an email address in the correct format, like name@example.com',
        'string.email': 'Enter an email address in the correct format, like name@example.com',
        'string.max': `The email must be ${this.maxEmailAddressLength} characters or fewer`
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
