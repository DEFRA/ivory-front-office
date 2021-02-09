const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
// const sinon = require('sinon')
const { register } = require('./route-flow')

const HomeHandlers = require('./test-handlers/home.handlers')
const FirstPageHandlers = require('./test-handlers/first-page.handlers')
const SecondPageHandlers = require('./test-handlers/second-page.handlers')

lab.experiment('defra-hapi-route-flow', () => {
  let flowConfig
  let handlersDir

  let home
  let firstPage
  let secondPage
  let thirdPage

  lab.beforeEach(async ({ context }) => {
    context.server = {
      app: {},
      route: () => {}
    }

    const { server } = context

    flowConfig = {
      home: {
        path: '/',
        next: 'first-page',
        handlers: 'home.handlers'
      },

      'first-page': {
        path: 'first-page',
        handlers: 'first-page.handlers',
        title: 'The first page',
        next: {
          query: 'skipPage',
          when: {
            false: 'second-page',
            true: 'third-page'
          }
        }
      },

      'second-page': {
        path: 'second-page',
        handlers: 'second-page.handlers',
        title: {
          query: 'isAlternative',
          when: {
            false: 'The second page',
            true: 'The alternative second page'
          }
        },
        next: 'third-page'
      },

      'third-page': {
        path: 'third-page',
        handlers: 'third-page.handlers',
        title: 'The third page',
        next: 'first-page'
      }
    }

    handlersDir = './test-handlers'

    server.flowEngine = await register(server, { flowConfig, handlersDir })

    home = await server.app.flow('home')
    firstPage = await server.app.flow('first-page')
    secondPage = await server.app.flow('second-page')
    thirdPage = await server.app.flow('third-page')
  })

  lab.test('register route-flow home', async ({ context }) => {
    const { server } = context

    Code.expect(home.handlers instanceof HomeHandlers).to.equal(true)
    Code.expect(home.handlers.constructor.server).to.equal(server)
    Code.expect(home.handlers.flowNode).to.equal(home)
    Code.expect(await home.handlers.getFlowNode('first-page')).to.equal(firstPage)
    Code.expect(await home.handlers.getNextPath()).to.equal('first-page')
  })

  lab.test('register route-flow first-page', async ({ context }) => {
    const { server } = context

    Code.expect(firstPage.handlers instanceof FirstPageHandlers).to.equal(true)
    Code.expect(firstPage.handlers.constructor.server).to.equal(server)
    Code.expect(firstPage.handlers.flowNode).to.equal(firstPage)
    Code.expect(await firstPage.handlers.getFlowNode('home')).to.equal(home)
    Code.expect(await firstPage.handlers.getNextPath({ skip: true })).to.equal('third-page')
    Code.expect(await firstPage.handlers.getPageHeading()).to.equal('The first page')
  })

  lab.test('register route-flow second-page', async ({ context }) => {
    const { server } = context

    Code.expect(secondPage.handlers instanceof SecondPageHandlers).to.equal(true)
    Code.expect(secondPage.handlers.constructor.server).to.equal(server)
    Code.expect(secondPage.handlers.flowNode).to.equal(secondPage)
    Code.expect(await secondPage.handlers.getFlowNode('third-page')).to.equal(thirdPage)
    Code.expect(await secondPage.handlers.getNextPath()).to.equal('third-page')
    Code.expect(await secondPage.handlers.getPageHeading({ alternative: true })).to.equal('The alternative second page')
  })
})
