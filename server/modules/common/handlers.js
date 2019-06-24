const Boom = require('@hapi/boom')

module.exports = class Handlers {
  constructor () {
    // validate getters.  Note the following will throw if any of the getters have not been set declared in the inherited routes
    (() => [this.path, this.nextPath, this.view, this.schema])()
  }

  get path () { throw Boom.badImplementation(`path getter not implemented in ${this.constructor.name}`) }
  get nextPath () { throw Boom.badImplementation(`nextPath getter not implemented in ${this.constructor.name}`) }
  get view () { throw Boom.badImplementation(`view getter not implemented in ${this.constructor.name}`) }
  get schema () { throw Boom.badImplementation(`schema getter not implemented in ${this.constructor.name}`) }

  getHandler (request, h, errors) {
    // The default getHandler
    return h.view(this.view, {
      view: request.payload ? request.payload : this.viewData,
      errors,
      errorList: errors && Object.values(errors)
    })
  }

  postHandler (request, h) {
    // The default postHandler
    h.state('session', request.state.session)
    return h.redirect(this.nextPath)
  }

  failAction (request, h, errors) {
    const errorMessages = {}

    // Format the error messages for the view
    errors.details.forEach(({ path, type }) => {
      const field = path[0]
      errorMessages[field] = {
        text: this.errorMessages[field][type],
        href: `#${field}`
      }
    })

    return this.getHandler(request, h, errorMessages)
      .code(400)
      .takeover()
  }
}
