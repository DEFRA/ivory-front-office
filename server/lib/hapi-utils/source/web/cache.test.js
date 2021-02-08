const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const TestHelper = require('../test-helper')
const Cache = require('./cache')

lab.experiment(TestHelper.getFile(__filename), () => {
  let sandbox
  const cache = {}
  const request = {
    yar: {
      get: (key) => cache[key],
      set: (key, val) => { cache[key] = val },
      reset: () => {
        Object.keys(cache).forEach((key) => delete cache[key])
      }
    }
  }

  lab.beforeEach(() => {
    // Stub methods
    sandbox = sinon.createSandbox()
    TestHelper.stubCommon(sandbox)
  })

  lab.afterEach(async () => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('get', () => {
    lab.test('when key is a string', async () => {
      cache.data = { foo: 'bar' }
      const data = await Cache.get(request, 'data')
      Code.expect(data).to.equal(cache.data)
    })

    lab.test('when key is a string and the data doesn\'t exist', async () => {
      delete cache.data
      const data = await Cache.get(request, 'data')
      Code.expect(data).to.equal(undefined)
    })

    lab.test('when key is an array of keys', async () => {
      Object.assign(cache, {
        'data-1': { foo: 'bar' },
        'data-2': { bar: 'foo' }
      })
      const [data1, data2] = await Cache.get(request,
        ['data-1', 'data-2'])
      Code.expect(data1).to.equal(cache['data-1'])
      Code.expect(data2).to.equal(cache['data-2'])
    })
  })

  lab.experiment('set', () => {
    lab.test('when data is valid', async () => {
      const data = { bar: 'foo' }
      await Cache.set(request, 'addedData', data)
      Code.expect(cache.addedData).to.equal(data)
    })
  })

  lab.experiment('clear', () => {
    lab.test('clears the cache correctly', async () => {
      cache.data = { foo: 'bar' }
      let data = await Cache.get(request, 'data')
      Code.expect(data).to.equal(cache.data)
      await Cache.clear(request)
      data = await Cache.get(request, 'data')
      Code.expect(data).to.equal(undefined)
    })
  })
})
