const hapi = require('@hapi/hapi')
const config = require('./config')

async function createServer () {
  // Create the hapi server
  const server = hapi.server({
    port: config.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    }
  })

  // Register the plugins
  await server.register(require('inert'))
  await server.register(require('./plugins/views'))
  await server.register(require('./plugins/router'))
  await server.register(require('./plugins/error-pages'))

  // Register the dev-only plugins
  if (config.isDev) {
    await server.register(require('blipp'))
    // await server.register(require('./plugins/logging'))
  }

  // Configure the session management cookie
  server.state('session', {
    ttl: null, // 'null' will delete the cookie when the browser is closed
    isSecure: false, // If 'true' the browser will only honor the cookie if there's a secured connection
    isHttpOnly: true,
    encoding: 'base64json',
    clearInvalid: true,
    strictHeader: true
  })

  return server
}

module.exports = createServer
