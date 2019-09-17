/*
* Add an `onPreResponse` listener to return error pages
*/

const { logger } = require('defra-logging-facade')
const { Registration } = require('../lib/cache')

// TODO: Handle finding no cookie is present

module.exports = {
  plugin: {
    name: 'error-pages',
    register: (server) => {
      server.ext('onPreResponse', async (request, h) => {
        const response = request.response

        if (response.isBoom) {
          // An error was raised during
          // processing the request
          const statusCode = response.output.statusCode

          switch (statusCode) {
            case 403:
            case 404:
              return h.view(`error-handling/${statusCode}`).code(statusCode)
            case 412:
              // Set the registration number in the cache only to prevent back button forgetting registration has already been sent
              await Registration.set(request, { registrationNumber: 'DUMMY' }, false)
              return h.view(`error-handling/${statusCode}`).code(statusCode)
            default:
              request.log('error', {
                statusCode: statusCode,
                data: response.data,
                message: response.message
              })

              // log an error to airbrake/errbit - the response object is actually an instanceof Error
              logger.serverError(response, request)

              // Then return the `500` view (HTTP 500 Internal Server Error )
              return h.view('error-handling/500').code(statusCode)
          }
        }
        return h.continue
      })
    }
  }
}
