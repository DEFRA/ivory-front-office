class CheckYourAnswersHandlers extends require('../common/handlers') {
  async getHandler (request, h, errors) {
    this.viewData = {}
    return super.getHandler(request, h, errors)
  }
}

const handlers = new CheckYourAnswersHandlers()

const path = '/check-your-answers'
const app = {
  pageHeading: `Check your answers`,
  view: 'core/check-your-answers',
  nextPath: '/no-idea'
}

module.exports = [
  {
    method: 'GET',
    path,
    handler: handlers.getHandler,
    options: {
      app,
      bind: handlers
    }
  },
  {
    method: 'POST',
    path,
    handler: handlers.postHandler,
    options: {
      app,
      bind: handlers
    }
  }
]
