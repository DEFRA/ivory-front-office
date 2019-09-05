const Joi = require('@hapi/joi')

class PersonEmailHandlers extends require('../handlers') {
  get schema () {
    return Joi.object({
      email: Joi.string().trim().email().required()
    })
  }

  get errorMessages () {
    return {
      email: {
        'any.empty': 'Enter an email address in the correct format, like name@example.com',
        'string.email': 'Enter an email address in the correct format, like name@example.com'
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
    await Person.set(request, person, true)
    return super.handlePost(request, h)
  }
}

module.exports = PersonEmailHandlers
