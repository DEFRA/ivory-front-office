class WhoOwnsHandlers extends require('../common/option/select-one-option.handlers') {
  get fieldName () {
    return 'ownerType'
  }

  get selectError () {
    return 'Select who owns the item'
  }

  // Overrides parent class getNextPath
  async getNextPath (request) {
    const { ownerType } = await this.getData(request)
    if (ownerType === 'agent') {
      return '/owner-name'
    } else {
      return '/agent-name'
    }
  }
}

const handlers = new WhoOwnsHandlers()

module.exports = handlers.routes({
  path: '/who-owns-item',
  app: {
    pageHeading: 'Who owns the item?',
    view: 'common/option/select-one-option',
    isQuestionPage: true
  }
  // nextPath is derived in the getNextPath method above
})
