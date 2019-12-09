const Joi = require('@hapi/joi')

class PersonNameHandlers extends require('defra-hapi-handlers') {
  get maxNameLength () {
    return 100
  }

  get schema () {
    return Joi.object({
      'full-name': Joi.string().trim().max(this.maxNameLength).required()
    })
  }

  get errorMessages () {
    return {
      'full-name': {
        'any.required': 'Enter your full name',
        'string.empty': 'Enter your full name',
        'string.max': `Enter your full name in ${this.maxNameLength} characters or less`
      }
    }
  }

  async fullNameLabel () {
    return 'Enter your full name'
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { Person } = this
    const person = await Person.get(request) || {}
    this.viewData = {
      'full-name': person.fullName,
      'full-name-label': await this.fullNameLabel(request)
    }
    return super.handleGet(request, h, errors)
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    const { Person } = this
    const person = await Person.get(request) || {}
    person.fullName = request.payload['full-name']
    await Person.set(request, person)
    return super.handlePost(request, h)
  }
}

module.exports = PersonNameHandlers
