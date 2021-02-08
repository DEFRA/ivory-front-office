const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const TestHelper = require('../test-helper')
const mixin = require('./mixin')

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

  lab.experiment('mixin', () => {
    lab.test('successfully mixes a class with a couple of mixin objects', async () => {
      class TestClass {
        get data () {
          return 'original data'
        }

        get things () {
          return 'original things'
        }
      }

      const mixinObj1 = {
        get stuff () {
          return 'mixed stuff'
        }
      }

      const mixinObj2 = {
        get accessories () {
          return 'mixed accessories'
        }
      }

      class MixedClass extends mixin(TestClass, mixinObj1, mixinObj2) {}

      const mixed = new MixedClass()

      Code.expect(mixed.data).to.equal('original data')
      Code.expect(mixed.stuff).to.equal('mixed stuff')
      Code.expect(mixed.accessories).to.equal('mixed accessories')
      Code.expect(mixed.things).to.equal('original things')
    })
  })
})
