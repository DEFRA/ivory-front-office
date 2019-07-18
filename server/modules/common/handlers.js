const { referenceData = {} } = require('../../config')

module.exports = class Handlers {
  // Override any of these methods in a child handlers class if required
  async getCache (request, key) {
    if (typeof key === 'string') {
      return request.yar.get(key) || {}
    }
    // Retrieve each item specified in the array of keys
    // usage: const [a, b, c] = await this.getCache(request, ['a', 'b', 'c'])
    return Promise.all(key.map(async (key) => {
      return this.getCache(request, key)
    }))
  }

  async setCache (request, key, val) {
    request.yar.set(key, val)
  }

  async getPageHeading (request) {
    return request.route.settings.app.pageHeading
  }

  async getFieldName (request) {
    return request.route.settings.app.fieldName
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

  async getViewData (request) {
    return this.viewData
  }

  async getHandler (request, h, errors) {
    // The default getHandler

    const pageHeading = await this.getPageHeading(request)
    const fieldName = await this.getFieldName(request)
    const viewName = await this.getViewName(request)
    const viewData = await this.getViewData(request)

    return h.view(viewName, {
      pageHeading,
      fieldName,
      viewData: request.payload ? request.payload : viewData,
      errors,
      errorList: errors && Object.values(errors)
    })
  }

  async postHandler (request, h) {
    // The default postHandler

    const nextPath = await this.getNextPath(request)

    return h.redirect(nextPath)
  }

  async failAction (request, h, errors) {
    const errorMessages = {}

    // Format the error messages for the view
    errors.details.forEach(({ path, type }) => {
      const field = path[0]
      errorMessages[field] = {
        text: this.errorMessages[field][type],
        href: `#${referenceData[field] ? `${field}-1` : field}` // If this is a reference data field, then link to first option
      }
    })

    const result = await this.getHandler(request, h, errorMessages)

    return result
      .code(400)
      .takeover()
  }

  routes ({ path, app }) {
    return [
      {
        method: 'GET',
        path,
        handler: this.getHandler,
        options: {
          app,
          bind: this
        }
      },
      {
        method: 'POST',
        path,
        handler: this.postHandler,
        options: {
          app,
          bind: this,
          validate: {
            payload: this.schema,
            failAction: this.failAction.bind(this)
          }
        }
      }
    ]
  }
}
