const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const errorHandling = require('./error-handling')
const { logger } = require('defra-logging-facade')
const contactLink = '/help-page'
const contactMessage = 'contact the help page'

lab.experiment('defra-error-handling', () => {
  const events = {}

  lab.beforeEach(async ({ context }) => {
    context.server = {
      ext: (event, callback) => {
        events[event] = callback
      }
    }

    context.request = {
      route: {
        path: '/unknown',
        settings: {
          validate: {
            failAction: (request, h, error) => {
              request.error = error
            }
          }
        }
      },
      response: { isBoom: true, output: { statusCode: 999 } },
      log: () => {},
      server: context.server
    }

    context.h = {
      get continue () {
        return true
      },

      view (view, context) {
        this.request.view = view
        this.request.context = context
        return {
          code: (code) => {
            this.request.code = code
          }
        }
      },

      request: context.request,

      redirect () {
        return {
          takeover: () => {}
        }
      }
    }

    // Create the sandbox to add stubs
    context.sandbox = sinon.createSandbox()
    context.sandbox.stub(logger, 'serverError').value(() => {})
  })

  lab.afterEach(async ({ context }) => {
    const { sandbox } = context
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('plugin is installed', async () => {
    lab.beforeEach(async ({ context }) => {
      const { server } = context
      await errorHandling(server, {
        handleFailedPrecondition: (request) => { request.failedPrecondition = true },
        contactLink,
        contactMessage
      })
    })

    const viewTests = [
      { errorCode: 500, statusCode: 500 },
      { errorCode: 417, statusCode: 500 },
      { statusCode: 403 },
      { statusCode: 404 }
    ]

    viewTests.forEach(({ statusCode, errorCode = statusCode }) =>
      lab.test(`and returns the error view with the status of ${statusCode} when the original was ${errorCode}`, async ({ context }) => {
        const { h, request } = context
        const viewContext = statusCode === 500 ? { statusCode } : {
          statusCode,
          contactMessage,
          contactLink
        }
        request.method = 'get'
        request.response.output.statusCode = errorCode || statusCode
        await events.onPreResponse(request, h)
        Code.expect(request.view).to.equal('error')
        Code.expect(request.context).to.equal(viewContext)
        Code.expect(request.code).to.equal(statusCode)
      })
    )

    lab.test('and returns the precondition handler with the status of 412', async ({ context }) => {
      const { h, request } = context
      request.method = 'get'
      request.response.output.statusCode = 412
      await events.onPreResponse(request, h)
      Code.expect(request.failedPrecondition).to.equal(true)
    })

    lab.test('and returns the fail action for a failed photo upload with a status of 413', async ({ context }) => {
      // eslint-disable-next-line no-unused-vars
      const { h, request } = context
      request.method = 'get'
      request.response.output.statusCode = 413
    })
  })
})
