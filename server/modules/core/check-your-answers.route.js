class CheckYourAnswersHandlers extends require('../common/handlers') {
  async getHandler (request, h, errors) {
    const [ owner, ownerAddress, item ] = await this.getCache(request, ['owner', 'owner-address', 'item'])
    this.viewData = { owner, ownerAddress, item }
    return super.getHandler(request, h, errors)
  }
}

const handlers = new CheckYourAnswersHandlers()

module.exports = handlers.routes({
  path: '/check-your-answers',
  app: {
    pageHeading: `Check your answers`,
    view: 'core/check-your-answers',
    nextPath: '/no-idea'
  }
})
