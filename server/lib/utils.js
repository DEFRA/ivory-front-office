module.exports = {
  // Usage: const val = getNestedVal(myObj, 'a.b.c')
  getNestedVal (nestedObj, path) {
    return path
      .split('.')
      .reduce((obj, key) => {
        return (obj && obj[key] !== 'undefined') ? obj[key] : undefined
      }, nestedObj)
  }
}
