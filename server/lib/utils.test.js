const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const TestHelper = require('../../test-helper')
const utils = require('./utils')

lab.experiment(TestHelper.getFile(__filename), () => {
  let sandbox

  lab.beforeEach(() => {
    // Stub methods
    sandbox = sinon.createSandbox()
    TestHelper.stubCommon(sandbox)
  })

  lab.afterEach(async () => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  lab.experiment('cloneAndMerge', () => {
    lab.test('properties are deleted when it is overridden with null', async () => {
      const obj1 = { a: 'details', b: { c: { d: 'deep details' } }, e: 'more details' }
      const obj1String = JSON.stringify(obj1)
      const obj2 = { e: null, f: 'other details', g: { h: 'even more deep details' } }
      const obj2String = JSON.stringify(obj2)
      const obj3 = utils.cloneAndMerge(obj1, obj2)

      // Make sure neither object has been mutated
      Code.expect(JSON.stringify(obj1)).to.equal(obj1String)
      Code.expect(JSON.stringify(obj2)).to.equal(obj2String)

      // Now make sure the merge happened correctly with the e property deleted
      Code.expect(JSON.stringify(obj3)).to.equal('{"a":"details","b":{"c":{"d":"deep details"}},"f":"other details","g":{"h":"even more deep details"}}')
    })
  })

  lab.experiment('Cache:', () => {
    const cache = {}
    const request = {
      yar: {
        get: (key) => cache[key],
        set: (key, val) => { cache[key] = val }
      }
    }

    lab.experiment('getCache', () => {
      lab.test('when key is a string', async () => {
        cache.data = { foo: 'bar' }
        const data = await utils.getCache(request, 'data')
        Code.expect(data).to.equal(cache.data)
      })

      lab.test(`when key is a string and the data doesn't exist`, async () => {
        delete cache.data
        const data = await utils.getCache(request, 'data')
        Code.expect(data).to.equal(undefined)
      })

      lab.test('when key is an array of keys', async () => {
        Object.assign(cache, {
          'data-1': { foo: 'bar' },
          'data-2': { bar: 'foo' }
        })
        const [data1, data2] = await utils.getCache(request,
          ['data-1', 'data-2'])
        Code.expect(data1).to.equal(cache['data-1'])
        Code.expect(data2).to.equal(cache['data-2'])
      })
    })

    lab.experiment('setCache', () => {
      lab.test('when data is valid', async () => {
        const data = { bar: 'foo' }
        await utils.setCache(request, 'addedData', data)
        Code.expect(cache.addedData).to.equal(data)
      })
    })
  })
})
