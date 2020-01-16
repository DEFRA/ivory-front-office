module.exports = {
  plugin: require('defra-hapi-error-handling'),
  options: {
    handleFailedPrecondition: async (request, h) => {
      const { flow } = request.server.app
      // ToDo: Need to support already submitted when designed

      // const { Registration } = require('ivory-data-mapping').cache
      // // Set the registration number in the cache only to prevent back button forgetting registration has already been sent
      // await Registration.set(request, { registrationNumber: 'DUMMY' }, false)
      // return h.view(`error-handling/${statusCode}`).code(statusCode)

      // Just redirect home for now
      const route = await flow('home')
      return h.redirect(route.path)
    },
    view: 'errors/error' // Note the view is in server/modules
  }
}
