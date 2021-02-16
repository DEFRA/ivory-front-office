require('array-flat-polyfill')
const Joi = require('joi')
const { logger } = require('defra-logging-facade')

// Base Handlers

module.exports = class Handlers {
  static set server (server) {
    Handlers._server = server
  }

  static get server () {
    return Handlers._server
  }

  get server () {
    return Handlers._server
  }

  get maxFreeTextLength () {
    return 3000
  }

  async getPageHeading (request) {
    return request.route.settings.app.pageHeading
  }

  async getNextPath (request) {
    return request.route.settings.app.nextPath
  }

  async getErrorPath (request) {
    return request.route.settings.app.errorPath
  }

  async getViewName (request) {
    return request.route.settings.app.view
  }

  async getViewData () {
    return this.viewData || {} // If viewData has not been set return an empty object (so a future 'Object.assign(viewData, ...' works)
  }

  async getIsQuestionPage (request) {
    return request.route.settings.app.isQuestionPage || false
  }

  async getBackLinkEnabled (request) {
    const { tags = [] } = request.route.settings
    return !tags.includes('hide-back-link')
  }

  async getGoogleAnalyticsId (request) {
    return request.server.app.googleAnalyticsId
  }

  get errorMessages () {
    throw new Error(`errorMessages have not been configured within the ${this.constructor.name} class`)
  }

  validate (...args) {
    const schema = Joi.isSchema(this.schema) ? this.schema : Joi.object(this.schema)
    return schema.validate(...args)
  }

  async handleGet (request, h, errors) {
    // The default handleGet

    const breadcrumbs = (this.getBreadcrumbs && await this.getBreadcrumbs(request)) || []
    const pageHeading = await this.getPageHeading(request)
    const viewName = await this.getViewName(request)
    const viewData = await this.getViewData(request)
    const isQuestionPage = await this.getIsQuestionPage(request)
    const googleAnalyticsId = await this.getGoogleAnalyticsId(request)
    const includeBacklink = await this.getBackLinkEnabled(request)
    const { fieldname } = this
    if (errors) {
      Object.assign(viewData, request.payload)
    }
    const errorList = errors && Object.values(errors)

    return h.view(viewName, {
      googleAnalyticsId,
      breadcrumbs,
      pageHeading,
      includeBacklink,
      isQuestionPage,
      fieldname,
      viewData,
      errors,
      errorList
    })
  }

  async handlePost (request, h) {
    // The default handlePost

    const nextPath = await this.getNextPath(request)

    return h.redirect(nextPath)
  }

  errorLink (field) {
    return `#${field}` // Can be overridden where required
  }

  async buildErrors (request, details) {
    const errorsByField = {}
    const errorMessages = typeof this.errorMessages === 'function' ? (await this.errorMessages(request)) : this.errorMessages
    const errors = await Promise.all(details
      .map(async ({ message, path, type, context = {} }) => {
        if (context.details) {
          return this.buildErrors(request, context.details)
        } else {
          const field = path[0]
          const text = errorMessages[field][type]
          const href = this.errorLink(field, type)
          const { label } = context
          if (!text) {
            logger.warn('Default message used: ', { field, type, message })
          }
          return { label, text: text || message, href, field, type }
        }
      }
      ))

    // Calculates prioritized position in error list (error not found is set to max so it's picked last)
    const getPosition = (types, type) => {
      return types.includes(type) ? types.indexOf(type) : Number.MAX_SAFE_INTEGER
    }

    // Now make sure there is only the prioritized error is displayed for that field
    errors.flat().forEach((error) => {
      if (errorsByField[error.field]) {
        const types = Object.keys(errorMessages[error.field])
        const currentIndex = getPosition(types, errorsByField[error.field].type)
        const newIndex = getPosition(types, error.type)
        if (newIndex < currentIndex) {
          errorsByField[error.field] = error
        }
      } else {
        errorsByField[error.field] = error
      }
    })

    // Return an array of the values
    return Object.values(errorsByField)
  }

  async formatErrors (request, errors) {
    const errorMessages = await this.buildErrors(request, errors.details)

    return Object.values(errorMessages).reduce((prev, { field, text, href }) => {
      prev[field] = { text, href }
      return prev
    }, {})
  }

  async failAction (request, h, errors) {
    const formattedErrors = await this.formatErrors(request, errors)
    const result = await this.handleGet(request, h, formattedErrors)

    return result
      .code(400)
      .takeover()
  }

  routes ({ path, app = {}, payload, plugins }) {
    const tags = app.tags || []
    app.handlers = this

    const routes = [
      {
        method: 'GET',
        path,
        handler: this.handleGet,
        options: {
          app,
          tags,
          plugins,
          bind: this
        }
      }
    ]

    // Only add a post handler if there is a view
    if (app.view) {
      routes.push({
        method: 'POST',
        path,
        handler: this.handlePost,
        options: {
          app,
          tags,
          plugins,
          bind: this,
          validate: {
            payload: this.schema,
            failAction: this.failAction.bind(this)
          },
          payload: payload || this.payload
        }
      })
    }

    return routes
  }
}
