const Joi = require('@hapi/joi')

class PersonNameHandlers extends require('../handlers') {
  get schema () {
    return Joi.object({
      'full-name': Joi.string().trim().required()
    })
  }

  get errorMessages () {
    return {
      'full-name': {
        'any.empty': 'Enter your full name'
      }
    }
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { Person } = this
    const person = await Person.get(request) || {}
    this.viewData = {
      'full-name': person.fullName,
      'full-name-label': this.fullNameLabel || 'Full name'
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
