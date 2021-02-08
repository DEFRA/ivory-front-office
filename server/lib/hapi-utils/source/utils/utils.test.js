const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const TestHelper = require('../test-helper')
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

  lab.experiment('getNestedVal', () => {
    lab.test('undefined is returned without crashing when path to property is not complete', async () => {
      const obj = {}
      Code.expect(utils.getNestedVal(obj, 'path.does.not.exist')).to.equal(undefined)
    })

    lab.test('value is returned when path to property is complete', async () => {
      const obj = { path: { does: { exist: true } } }
      Code.expect(utils.getNestedVal(obj, 'path.does.exist')).to.equal(true)
    })
  })

  lab.experiment('setNestedVal', () => {
    lab.test('sets the final nested item when the path to the property does not originally exist', async () => {
      const obj = {}
      utils.setNestedVal(obj, 'path.does.not.exist', 10)
      Code.expect(obj.path.does.not.exist).to.equal(10)
    })

    lab.test('sets the final nested item when the path to the property does originally exist', async () => {
      const obj = { path: { does: { exist: 5 } } }
      utils.setNestedVal(obj, 'path.does.not.exist', 5)
      Code.expect(obj.path.does.not.exist).to.equal(5)
    })
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

  lab.experiment('difference', () => {
    lab.test('between two objects', async () => {
      const current = { a: 'original', b: 'changed', e: 'original', f: true }
      const previous = { a: 'original', b: 'original', e: 'original', f: false }
      const diff = utils.difference(current, previous)

      // Now make sure the merge happened correctly with the e property deleted
      Code.expect(JSON.stringify(diff)).to.equal('{"b":"changed","f":true}')
    })
  })

  lab.experiment('until and sleep', () => {
    lab.test('delay until function returns true', async () => {
      let count = 0
      await utils.until(() => {
        count++
        return count === 10
      })
      Code.expect(count).to.equal(10)
    })
  })
})
