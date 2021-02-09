class FirstPageHandlers extends require('../../../lib/handlers/handlers') {
  async skipPage ({ skip }) {
    return skip
  }
}

module.exports = FirstPageHandlers
