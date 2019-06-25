
module.exports = class Handlers {
  // Override any of these methods in a child handlers class if required
  async getPageHeading (request) {
    return request.route.settings.app.pageHeading
  }

  async getNextPath (request) {
    return request.route.settings.app.nextPath
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
    const viewName = await this.getViewName(request)
    const viewData = await this.getViewData(request)

    return h.view(viewName, {
      pageHeading,
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
        href: `#${field}`
      }
    })

    const result = await this.getHandler(request, h, errorMessages)

    return result
      .code(400)
      .takeover()
  }
}
