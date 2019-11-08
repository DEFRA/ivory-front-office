/*
* Add an `onPreResponse` listener to return error pages
*/

const Joi = require('@hapi/joi')
const { logger } = require('defra-logging-facade')
const { flow } = require('./../flow')

// Creates a custom joi validation error structure
function createError (request, h, field, type) {
  // Generate an example error structure
  const schema = Joi.object({ [field]: Joi.string() })
  const errors = schema.validate({ [field]: true })
  const [error] = errors.error.details
  // Replace contents with error we want to create
  error.message = `"${field}" ${request.response.message}`
  error.type = type
  return errors.error
}

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
            case 412: {
              // ToDo: Need to support already submitted when designed

              // const { Registration } = require('ivory-data-mapping').cache
              // // Set the registration number in the cache only to prevent back button forgetting registration has already been sent
              // await Registration.set(request, { registrationNumber: 'DUMMY' }, false)
              // return h.view(`error-handling/${statusCode}`).code(statusCode)

              // Just redirect home for now
              return h.redirect(flow.home.path)
            }
            case 413: {
              const error = createError(request, h, 'photograph', 'binary.max')
              return request.route.settings.validate.failAction(request, h, error)
            }
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
