module.exports = {
  async get () {
    const number = `${Math.floor(Math.random() * 999999)}`.padStart(6, '0')
    return `IVR${number}`
  }
}
