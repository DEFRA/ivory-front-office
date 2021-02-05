const { logger } = require('defra-logging-facade')

module.exports = async (server, options = {}) => {
  const {
    contactMessage = 'contact the Ivory Service Helpline',
    contactLink = '#'
  } = options

  const {
    handleFailedPrecondition = (request, h) => h.redirect('/'),
    view = 'error'
  } = options

  server.ext('onPreResponse', async (request, h) => {
    const response = request.response

    if (response.isBoom) {
      // An error was raised during
      // processing the request
      const statusCode = response.output.statusCode

      switch (statusCode) {
        case 403:
        case 404:
          return h.view(`${view}`, { statusCode, contactMessage, contactLink }).code(statusCode)
        case 412: {
          return handleFailedPrecondition(request, h)
        }
        case 413: {
          if (request.method !== 'get') {
            return request.route.settings.validate.failAction(request, h)
          }
        }
        // eslint-disable-next-line no-fallthrough
        case 408: {
          if (request.method !== 'get') {
            return request.route.settings.validate.failAction(request, h)
          }
        }
        // eslint-disable-next-line no-fallthrough
        default:
          request.log('error', {
            statusCode: statusCode,
            data: response.data,
            message: response.message
          })

          // log an error to airbrake/errbit - the response object is actually an instanceof Error
          logger.serverError(response, request)

          // Then return the `500` view (HTTP 500 Internal Server Error )
          return h.view(`${view}`, { statusCode: 500 }).code(500)
      }
    }
    return h.continue
  })
}
