const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const TestHelper = require('../../../test-helper')
const config = require('../../config')
const url = '/check-your-answers'
const pageHeading = 'Check your answers'

lab.experiment(TestHelper.getFile(__filename), () => {
  const routesHelper = TestHelper.createRoutesHelper(lab, __filename)

  routesHelper.getRequestTests({ lab, pageHeading, url }, () => {
    lab.beforeEach(({ context }) => {
      const { sandbox } = context
      sandbox.stub(config, 'referenceData').value({
        dealingIntent: {
          choices: [
            { shortName: 'hire', label: 'hire', display: 'Hire' },
            { shortName: 'sell', label: 'sell', display: 'Sale' }
          ]
        },
        itemType: {
          choices: [
            {
              shortName: 'portrait-miniature-pre-1918',
              label: 'portrait-miniature-pre-1918',
              ageExemptionDeclaration: 'the item was made before 1918',
              volumeExemptionDeclaration: 'the portrait miniature is less than 320cm²'
            }
          ]
        }
      })
    })

    lab.test('page answers are displayed correctly', async ({ context }) => {
      const agentIsOwner = true
      const dealingIntent = 'hire'
      const dealingIntentDisplay = 'Hire'
      const itemType = 'portrait-miniature-pre-1918'
      const fullName = 'James Bond'
      const email = 'james007@bond.co.uk'
      const addressLine = 'THRIVE RENEWABLES PLC, DEANERY ROAD, BRISTOL, BS1 5AH'
      const description = 'A violin bow with an ivory tip.'
      const ageExemptionDeclaration = true
      const ageExemptionDescription = 'an explanation for age exemption'
      const volumeExemptionDeclaration = true
      const volumeExemptionDescription = 'an explanation for volume exemption'
      const ageExemptionDeclarationLabel = 'I declare the item was made before 1918'
      const volumeExemptionDeclarationLabel = 'I declare the portrait miniature is less than 320cm²'

      Object.assign(routesHelper.cache, {
        Registration: { dealingIntent, agentIsOwner },
        Owner: { fullName, email },
        OwnerAddress: { addressLine },
        Item: {
          description,
          itemType,
          ageExemptionDeclaration,
          ageExemptionDescription,
          volumeExemptionDeclaration,
          volumeExemptionDescription
        }
      })

      const response = await routesHelper.server.inject(context.request)
      const $ = routesHelper.getDomParser(response.payload)

      Code.expect($('.ivory-item-type').text()).to.include(itemType)
      Code.expect($('.ivory-description').text()).to.include(description)
      Code.expect($('.ivory-age-of-ivory').text()).to.include(ageExemptionDescription)
      Code.expect($('.ivory-age-of-ivory').text()).to.include(ageExemptionDeclarationLabel)
      Code.expect($('.ivory-volume-of-ivory').text()).to.include(volumeExemptionDescription)
      Code.expect($('.ivory-volume-of-ivory').text()).to.include(volumeExemptionDeclarationLabel)
      Code.expect($('.ivory-your-name').text()).to.include(fullName)
      Code.expect($('.ivory-your-address').text()).to.include(addressLine.split(',').join(''))
      Code.expect($('.ivory-your-email').text()).to.include(email)
      Code.expect($('.ivory-intention').text()).to.include(dealingIntentDisplay)
    })
  })
})
