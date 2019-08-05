const Wreck = require('@hapi/wreck')
const { logger } = require('defra-logging-facade')
const config = require('../config')
// const { getNestedVal, delay } = require('ivory').utils
const { getNestedVal } = require('ivory').utils

async function load (path) {
  const { serviceApi } = config
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
  logger.info('Waiting for ivory services to load')
  // await delay(1000) // Wait 1 second to allow ivory-api to load data
  const groups = await load('/groups')
  const choices = await load('/choices')
  const referenceData = {}
  groups.forEach((group) => {
    group.choices = choices
      .sort(({ rank: firstRank }, { rank: secondRank }) => firstRank > secondRank)
      .filter(({ groupId }) => groupId === group.id)
      .map((choice) => Object.assign(choice, { value: choice.value !== undefined ? choice.value : choice.shortName }))
    referenceData[group.type] = group
  })
  return referenceData
}

module.exports = loadReferenceData
