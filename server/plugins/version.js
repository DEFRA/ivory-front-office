
const { serviceApi } = require('../config')

module.exports = {
  plugin: require('hapi-version-status'),
  options: {
    path: '/version',
    view: 'common/version',
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
