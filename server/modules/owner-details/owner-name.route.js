const Joi = require('@hapi/joi')

class OwnerNameHandlers extends require('../common/handlers') {
  get path () {
    return '/owner-name'
  }

  get nextPath () {
    return '/owner-address-find'
  }

  get view () {
    return `owner-details${this.path}`
  }

  get schema () {
    return {
      'full-name': Joi.string().required()
    }
  }

  get errorMessages () {
    return {
      'full-name': {
        'any.empty': 'Enter your full name'
      }
    }
  }

  getHandler (request, h, errors) {
    const { owner = {} } = request.state.session || {}
    this.viewData = {
      'full-name': owner.fullName
    }
    return super.getHandler(request, h, errors)
  }

  postHandler (request, h) {
    const { owner = {} } = request.state.session
    owner.fullName = request.payload['full-name']
    request.state.session.owner = owner
    return super.postHandler(request, h)
  }
}

const handlers = new OwnerNameHandlers()

module.exports = [
  {
    method: 'GET',
    path: handlers.path,
    handler: handlers.getHandler.bind(handlers)
  },
  {
    method: 'POST',
    path: handlers.path,
    handler: handlers.postHandler.bind(handlers),
    options: {
      validate: {
        payload: handlers.schema,
        failAction: handlers.failAction.bind(handlers)
      }
    }
  }
]
