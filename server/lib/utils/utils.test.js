const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const utils = require('./utils')

lab.experiment(TestHelper.getFile(__filename), () => {
  lab.experiment('config', () => {
    lab.test('config throws error if it hasn\'t been set', async () => {
      let error
      let config
      try {
        config = utils.config
      } catch (err) {
        error = err
      }
      Code.expect(config).to.equal(undefined)
      Code.expect(error).to.equal(new Error('Config not set in common modules'))
    })

    lab.test('config is set and retrieved correctly', async () => {
      const config = { data: {} }
      utils.setConfig(config)
      Code.expect(utils.config).to.equal(config)
    })
  })

  lab.experiment('createError', () => {
    lab.test('Hapi error structure is created correctly', async () => {
      const request = {
        response: {
          message: 'default message'
        }
      }
      const field = 'name'
      const type = 'name.invalid'
      const error = utils.createError(request, field, type)
      const details = error.details[0]

      Code.expect(details.message).to.equal(`"${field}" ${request.response.message}`)
      Code.expect(details.path).to.equal([field])
      Code.expect(details.type).to.equal(type)
    })
  })
})
