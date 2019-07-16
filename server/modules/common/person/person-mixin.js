const Persistence = require('../persistence')
const persistence = new Persistence({ path: '/people' })

module.exports = {
  async getPerson (request) {
    return this.getCache(request, this.personType) || {}
  },

  async setPerson (request, person, persistToDatabase) {
    if (persistToDatabase) {
      const { id, fullName, email } = person
      const saved = await persistence.save({ id, fullName, email })
      person.id = saved.id
    }
    return this.setCache(request, this.personType, person)
  }
}
