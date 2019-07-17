const Wreck = require('@hapi/wreck')
const { logger } = require('defra-logging-facade')
const { serviceApi } = require('../config')
const { getNestedVal } = require('../lib/utils')

async function load (path) {
  const headers = {
    'Content-Type': 'application/json'
  }
  const uri = serviceApi + path
  try {
    const res = await Wreck.request('GET', uri, { headers })
    return Wreck.read(res, { json: true })
  } catch (error) {
    const { statusCode, message } = getNestedVal(error, 'output.payload') || {}
    logger.error(`message: ${message}, statusCode: ${statusCode}, method: 'GET', uri: ${uri}`)
    throw error
  }
}

async function loadReferenceData () {
  const groups = await load('/groups')
  const choices = await load('/choices')
  const referenceData = {}
  groups.forEach((group) => {
    group.choices = choices.filter(({ groupId }) => groupId === group.id)
    referenceData[group.type] = group
  })
  return referenceData
}

module.exports = loadReferenceData
