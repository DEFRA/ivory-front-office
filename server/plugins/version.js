
const { serviceApi } = require('../config')

module.exports = {
  plugin: require('hapi-version-status'),
  options: {
    path: '/version',
    view: 'version/version', // Note the view is in server/modules
    viewData: {
      pageHeading: 'Service status and versions'
    },
    serviceVersionPaths: [
      `${serviceApi}/version`
    ],
    options: {
      tags: ['always']
    }
  }
}
