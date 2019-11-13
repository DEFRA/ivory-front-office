const { flow } = require('../flow')
const { errorPages } = require('ivory-common-modules').plugins

module.exports = {
  options: {
    handleFailedPrecondition: (request, h) => {
      // ToDo: Need to support already submitted when designed

      // const { Registration } = require('ivory-data-mapping').cache
      // // Set the registration number in the cache only to prevent back button forgetting registration has already been sent
      // await Registration.set(request, { registrationNumber: 'DUMMY' }, false)
      // return h.view(`error-handling/${statusCode}`).code(statusCode)

      // Just redirect home for now
      return h.redirect(flow.home.path)
    }
  },
  plugin: {
    name: 'error-pages',
    register: errorPages
  }
}
