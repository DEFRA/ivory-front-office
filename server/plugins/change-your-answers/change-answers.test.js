const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const changeAnswers = require('./change-answers')
const checkYourAnswersPath = '/check-your-answers'
const originalNextPath = '/original-next-path'

lab.experiment('defra-hapi-change-answers', () => {
  const events = {}
  let nextPath
  let initalised

  lab.beforeEach(async ({ context }) => {
    initalised = false

    context.server = {
      ext: (event, callback) => {
        events[event] = callback
      }
    }

    context.request = {
      route: { path: '/' },
      server: context.server,
      info: { referrer: `http://fake-site.com${checkYourAnswersPath}` }
    }

    context.h = {
      get continue () {
        return true
      },

      request: context.request,

      redirect (path) {
        nextPath = path
        return {
          takeover: () => {}
        }
      }
    }

    // Create the sandbox to add stubs
    context.sandbox = sinon.createSandbox()
  })

  lab.afterEach(async ({ context }) => {
    const { sandbox } = context
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('plugin is installed', async () => {
    lab.beforeEach(async ({ context }) => {
      const { server, request } = context
      request.changing = true
      await changeAnswers(server, {
        init: () => { initalised = true },
        ignoreRoute: (request) => request.ignore,
        checkYourAnswersPath,
        setChanging: (request, val) => { request.changing = val },
        isChanging: (request) => request.changing,
        validData: (request) => request.hasValidData
      })
    })

    lab.test('check initialised correctly', async ({ context }) => {
      Code.expect(initalised).to.equal(true)
    })

    lab.test('and sets the changing flag to true when the referrer of a get method is the check your answers path', async ({ context }) => {
      const { h, request } = context
      request.method = 'get'
      await events.onPostAuth(request, h)
      Code.expect(request.changing).to.equal(true)
    })

    lab.test('and does not set the changing flag to true when the method is get and the route is ignored', async ({ context }) => {
      const { h, request } = context
      request.method = 'get'
      request.ignore = true
      await events.onPostAuth(request, h)
      Code.expect(request.changing).to.equal(true)
    })

    lab.experiment('post method', () => {
      lab.beforeEach(({ context }) => {
        const { request } = context
        request.method = 'post'
        request.hasValidData = true
        request.ignore = false
        nextPath = originalNextPath
      })

      lab.test('and continues in the event of an onPostAuth event', async ({ context }) => {
        const { h, request } = context
        request.changing = false
        await events.onPostAuth(request, h)
        Code.expect(request.changing).to.equal(false)
        Code.expect(nextPath).to.equal(originalNextPath)
      })

      lab.test('and sets the changing flag to false and redirects to the check your answers path if the data is valid', async ({ context }) => {
        const { h, request } = context
        await events.onPostHandler(request, h)
        Code.expect(request.changing).to.equal(false)
        Code.expect(nextPath).to.equal(checkYourAnswersPath)
      })

      lab.test('and leaves the changing flag as true and continues on to the original path if the route is to be ignored', async ({ context }) => {
        const { h, request } = context
        request.ignore = true
        await events.onPostHandler(request, h)
        Code.expect(request.changing).to.equal(true)
        Code.expect(nextPath).to.equal(originalNextPath)
      })

      lab.test('and continues on to the original path if the changing flag is false', async ({ context }) => {
        const { h, request } = context
        request.changing = false
        await events.onPostHandler(request, h)
        Code.expect(request.changing).to.equal(false)
        Code.expect(nextPath).to.equal(originalNextPath)
      })

      lab.test('and leaves the changing flag as true and continues on to the original path if the data is invalid', async ({ context }) => {
        const { h, request } = context
        request.hasValidData = false
        await events.onPostHandler(request, h)
        Code.expect(request.changing).to.equal(true)
        Code.expect(nextPath).to.equal(originalNextPath)
      })
    })
  })
})
