class WhoOwnsHandlers extends require('../common/option/select-one-option.handlers') {
  get fieldName () {
    return 'agentIsOwner'
  }

  get selectError () {
    return 'Select who owns the item'
  }

  // Overrides parent class getNextPath
  async getNextPath (request) {
    const { agentIsOwner } = await this.getData(request)
    if (agentIsOwner) {
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
