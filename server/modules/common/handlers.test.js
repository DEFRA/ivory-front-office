const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const Handlers = require('./handlers')

lab.experiment('Test Base Handlers', () => {
  const testHelper = new TestHelper(lab, { stubCache: false })

  testHelper.getDomParser()
  const handlers = new Handlers()
  const request = {
    yar: {
      get: (key) => testHelper.cache[key],
      set: (key, val) => { testHelper.cache[key] = val }
    }
  }

  lab.test('getCache when key is a string', async () => {
    testHelper.cache.data = { foo: 'bar' }
    const data = await handlers.getCache(request, 'data')
    Code.expect(data).to.equal(testHelper.cache.data)
  })

  lab.test(`getCache when key is a string and the data doesn't exist`, async () => {
    delete testHelper.cache.data
    const data = await handlers.getCache(request, 'data')
    Code.expect(data).to.equal({})
  })

  lab.test('getCache when key is a string', async () => {
    Object.assign(testHelper.cache, {
      'data-1': { foo: 'bar' },
      'data-2': { bar: 'foo' }
    })
    const [data1, data2] = await handlers.getCache(request, ['data-1', 'data-2'])
    Code.expect(data1).to.equal(testHelper.cache['data-1'])
    Code.expect(data2).to.equal(testHelper.cache['data-2'])
  })

  lab.test('setCache', async () => {
    const data = { bar: 'foo' }
    await handlers.setCache(request, 'addedData', data)
    Code.expect(testHelper.cache.addedData).to.equal(data)
  })
})
