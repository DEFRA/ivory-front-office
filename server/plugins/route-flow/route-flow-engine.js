
const merge = require('deepmerge')
let flow

async function until (fn) {
  while (!fn()) {
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

class RouteFlowEngine {
  constructor (options = {}) {
    const { config, createRoutes, resolveQuery } = options

    if (typeof config === 'object') {
      this._config = merge({}, config)
    } else {
      throw new Error('config object required')
    }

    if (typeof createRoutes === 'function') {
      this._createRoutes = createRoutes
    } else {
      throw new Error('createRoutes function required')
    }

    if (typeof resolveQuery === 'function') {
      this._resolveQuery = resolveQuery
    } else {
      throw new Error('resolveQuery function required')
    }

    this._parseFlow(config, resolveQuery)
  }

  _parseFlow (config) {
    flow = this._flow = merge({}, config)
    Promise.all(Object.entries(this._flow)
      .map(async ([id, node]) => {
        const { next, title } = node
        node.id = id
        node.next = this.resolveAttribute(id, 'next', next, (val) => this._flow[val])
        node.title = this.resolveAttribute(id, 'title', title)
        return this._createRoutes(node)
      })
    )
  }

  resolveAttribute (id, attr, val, fn = (val) => val) {
    if (typeof val === 'string') {
      return async () => {
        return fn(val)
      }
    } else if (typeof val === 'object') {
      const { query, when } = val
      if (typeof query === 'string' && typeof when === 'object') {
        return async (...args) => {
          const result = await this._resolveQuery(this.flow[id], query, ...args)
          if (result === undefined) {
            throw new Error(`Expected the "${attr}" query result for "${id}" to be one of "${Object.keys(when).join('", "')}" instead of "${result}"`)
          }
          if (Object.keys(when).includes(result.toString())) {
            return fn(when[result])
          } else {
            throw new Error(`Expected the "${attr}" query result for "${id}" to be one of "${Object.keys(when).join('", "')}" instead of "${result}"`)
          }
        }
      } else {
        throw new Error(`Expected the "${attr}" attribute for "${id}" to contain a "query" function and a "when" object`)
      }
    }
  }

  get config () {
    return this._config
  }

  get flow () {
    return this._flow
  }

  static async flow (name) {
    // get global reference to flow
    await until(() => flow)
    return flow[name]
  }
}

module.exports = {
  RouteFlowEngine
}
