const utils = require('../../lib/utils')

class ExampleOneChoiceHandlers extends require('../common/option/select-one-option.handlers') {
  get referenceData () {
    return {
      hint: 'Hinting about this',
      choices: [
        {
          label: 'first choice',
          shortName: 'first'
        },
        {
          label: 'Second choice',
          shortName: 'second',
          hint: 'This is a hint'
        },
        {
          label: 'Third choice',
          shortName: 'third'
        },
        {
          label: 'Other',
          shortName: 'other',
          conditional: {
            label: 'Custom choice',
            fieldName: 'other-choice'
          }
        }
      ]
    }
  }

  get fieldName () {
    return 'exampleId'
  }

  get selectError () {
    return 'Please select one item'
  }

  async getData (request) {
    return await utils.getCache(request, 'examples') || {}
  }

  async setData (request, data) {
    return utils.setCache(request, 'examples', data)
  }

  errorLink (field) {
    return `#${field}-1`
  }
}

const handlers = new ExampleOneChoiceHandlers()

module.exports = handlers.routes({
  path: '/examples/example-one-choice',
  app: {
    pageHeading: 'What is your choice?',
    view: 'common/option/select-one-option'
  },
  nextPath: '/examples'
})
