require('dotenv').config() // Load variables from .env before any other code (especially before requiring the config.js)
const hapi = require('@hapi/hapi')
const config = require('./config')

const serverOptions = {
  port: config.port,
  routes: {
    validate: {
      options: {
        abortEarly: false
      }
    }
  }
}

const sessionOptions = {
  ttl: null, // 'null' will delete the cookie when the browser is closed
  isSecure: false, // If 'true' the browser will only honor the cookie if there's a secured connection
  isHttpOnly: true,
  encoding: 'base64json',
  clearInvalid: true,
  strictHeader: true
}

async function createServer () {
  // Create the hapi server
  const server = hapi.server(serverOptions)

  // Register the plugins
  await server.register([
    require('@hapi/inert'),
    require('./plugins/views'),
    require('./plugins/router'),
    require('./plugins/error-pages')
  ])

  // Register the dev-only plugins
  if (config.isDev) {
    await server.register([
      require('blipp')
      // require('./plugins/logging')
    ])
  }

  // Configure the session management cookie
  server.state('session', sessionOptions)

  return server
}

module.exports = createServer
