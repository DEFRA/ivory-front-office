const { cookieOptions } = require('../config')

module.exports = {
  plugin: require('@hapi/yar'),
  options: {
    cache: {
      expiresIn: 60 * 60 * 1000
    },
    maxCookieSize: 0, // Forces server-side storage only
    storeBlank: false,
    cookieOptions
  }
}
