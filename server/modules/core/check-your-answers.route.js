class CheckYourAnswersHandlers extends require('../base/handlers') {
  async getHandler (request, h, errors) {
    this.viewData = {}
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
