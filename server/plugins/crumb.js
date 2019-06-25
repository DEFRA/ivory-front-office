const { cookieOptions } = require('../config')

module.exports = {
  plugin: require('@hapi/crumb'),
  options: {
    cookieOptions,
    key: 'DefraCsrfToken',
    autoGenerate: true,
    logUnauthorized: true
  }
}
