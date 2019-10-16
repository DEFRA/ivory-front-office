const { getNestedVal } = require('ivory-shared/lib').utils
const yaml = require('js-yaml')
const fs = require('fs')
const flow = yaml.safeLoad(fs.readFileSync(`${__dirname}/flow.yml`, 'utf8'))

function parseFlow (subFlow) {
  Object.values(subFlow).forEach((val) => {
    if (!val.path) {
      // Must be a sub-flow
      return parseFlow(val)
    }
    switch (typeof val.next) {
      case 'string': {
        val.next = getNestedVal(flow, val.next)
        break
      }
      case 'object': {
        const { query, result } = val.next
        if (query && result) {
          Object.entries(result).forEach(([key, val]) => {
            result[key] = getNestedVal(flow, val)
          })
        } else {
          throw new Error(`Flow config not valid for path: ${val.path}`)
        }
        break
      }
    }
  })
}

parseFlow(flow)

function getRoutes (flowId) {
  const { path, next = {}, pageHeading = '', isQuestionPage = false, view, tags = [] } = getNestedVal(flow, flowId) || {}
  if (!path) {
    throw new Error(`Path could not be determined for ${flowId}`)
  }

  // Override getNextPath if query specified
  if (next.query) {
    const query = this[next.query]
    if (typeof query === 'function') {
      this.getNextPath = async (request) => {
        const val = await query.bind(this)(request)
        const result = next.result[val.toString()]
        if (result && result.path) {
          return result.path
        } else {
          throw new Error(`Expected route class ${this.constructor.name} to have a result after function "${next.query}" executed`)
        }
      }
    } else {
      throw new Error(`Expected route class ${this.constructor.name} to have function "${next.query}" declared`)
    }
  }

  // Override getPageHeading if query specified
  if (pageHeading && pageHeading.query) {
    const query = this[pageHeading.query]
    if (typeof query === 'function') {
      this.getPageHeading = async (request) => {
        const val = await query.bind(this)(request)
        const result = pageHeading.result[val.toString()]
        if (result) {
          return result
        } else {
          throw new Error(`Expected route class ${this.constructor.name} to have a result after function "${pageHeading.query}" executed`)
        }
      }
    } else {
      throw new Error(`Expected route class ${this.constructor.name} to have function "${pageHeading.query}" declared`)
    }
  }
  return {
    path,
    app: {
      pageHeading: typeof pageHeading === 'string' && pageHeading,
      nextPath: next.path,
      view,
      isQuestionPage,
      tags
    }
  }
}

module.exports = { getRoutes, flow }
