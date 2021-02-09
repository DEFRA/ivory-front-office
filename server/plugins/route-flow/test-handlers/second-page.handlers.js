class SecondPageHandlers extends require('../../../lib/handlers/handlers') {
  async isAlternative ({ alternative }) {
    return alternative
  }
}

module.exports = SecondPageHandlers
