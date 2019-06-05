/*
* Add an `onPreResponse` listener to return error pages
*/

// TODO: Handle finding no cookie is present

module.exports = {
  plugin: {
    name: 'error-pages',
    register: (server, options) => {
      server.ext('onPreResponse', (request, h) => {
        const response = request.response

        if (response.isBoom) {
          // An error was raised during
          // processing the request
          const statusCode = response.output.statusCode

          // In the event of 404 (HTTP 404 Not Found)
          // return the `404` view
          if (statusCode === 404) {
            return h.view('error-handling/404').code(statusCode)
          }

          request.log('error', {
            statusCode: statusCode,
            data: response.data,
            message: response.message
          })

          // Then return the `500` view (HTTP 500 Internal Server Error )
          return h.view('error-handling/500').code(statusCode)
        }
        return h.continue
      })
    }
  }
}
