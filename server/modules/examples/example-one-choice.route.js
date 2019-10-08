const { Cache } = require('ivory-shared')

class ExampleOneChoiceHandlers extends require('ivory-common-modules').option.single.handlers {
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
            fieldname: 'other-choice'
          }
        }
      ]
    }
  }

  get fieldname () {
    return 'exampleId'
  }

  get selectError () {
    return 'Please select one item'
  }

  async getData (request) {
    return await Cache.get(request, 'examples') || {}
  }

  async setData (request, data) {
    return Cache.set(request, 'examples', data)
  }

  errorLink (field) {
    return `#${field}-1`
  }
}

const handlers = new ExampleOneChoiceHandlers(require('../../config'))

module.exports = handlers.routes({
  path: '/examples/example-one-choice',
  app: {
    pageHeading: 'What is your choice?',
    view: 'common/select-one-option'
  },
  nextPath: '/examples'
})
