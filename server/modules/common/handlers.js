const { utils } = require('ivory-shared')

module.exports = class Handlers {
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

  async handleGet (request, h, errors) {
    // The default handleGet

    const pageHeading = await this.getPageHeading(request)
    const viewName = await this.getViewName(request)
    const viewData = await this.getViewData(request)
    const isQuestionPage = await this.getIsQuestionPage(request)
    const { fieldName } = this
    if (errors) {
      Object.assign(viewData, request.payload)
    }
    const errorList = errors && Object.values(errors)

    return h.view(viewName, {
      pageHeading,
      isQuestionPage,
      fieldName,
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

  async failAction (request, h, errors) {
    const errorMessages = {}

    // Format the error messages for the view
    await Promise.all(errors.details.map(async ({ path, type, message }) => {
      const field = path[0]
      errorMessages[field] = {
        text: typeof this.errorMessages === 'function' ? (await this.errorMessages(request))[field][type] : this.errorMessages[field][type],
        href: this.errorLink(field)
      }
      if (!errorMessages[field].text) {
        // use default message if not specified
        errorMessages[field].text = message
      }
    }))

    const result = await this.handleGet(request, h, errorMessages)

    return result
      .code(400)
      .takeover()
  }

  routes ({ path, app, payload }) {
    const tags = utils.getNestedVal(app, 'tags') || []
    return [
      {
        method: 'GET',
        path,
        handler: this.handleGet,
        options: {
          app,
          tags,
          bind: this
        }
      },
      {
        method: 'POST',
        path,
        handler: this.handlePost,
        options: {
          app,
          tags,
          bind: this,
          validate: {
            payload: this.schema,
            failAction: this.failAction.bind(this)
          },
          payload
        }
      }
    ]
  }
}
