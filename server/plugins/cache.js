const { cookieOptions } = require('../config')

module.exports = {
  plugin: require('@hapi/yar'),
  options: {
    maxCookieSize: 0, // Forces server-side storage only
    storeBlank: false,
    cookieOptions
  }
}
