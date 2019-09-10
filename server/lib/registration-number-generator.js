module.exports = {
  async get () {
    return `IVR${Math.random() * 6 + 1}`
  }
}
