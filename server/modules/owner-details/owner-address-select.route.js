const path = '/owner-address-select'
const addressLookup = require('../../lib/connectors/address-lookup/addressLookup')

module.exports = [{
  method: 'GET',
  path: path,
  // TODO: Set as 'async' to ensure the addressLookup function completed.  Is this good practice in a route handler?
  handler: async function (request, h) {
    // TODO: Handle no results returned etc.
    const addressLookupResults = await addressLookup(request.query.postcode)

    return h.view(`owner-details${path}`, {
      session: request.state.session,
      addressesFound: addressLookupResults.header.totalresults,
      addresses: addressLookupResults.results
    })
  }
}, {
  method: 'POST',
  path: path,
  handler: function (request, h) {
    // Set input in session cookie
    const chosenAddress = JSON.parse(request.payload.address)
    request.state.session.ownerAddressLine = chosenAddress.AddressLine
    request.state.session.ownerAddressUPRN = chosenAddress.UPRN
    h.state('session', request.state.session)

    return h.redirect('/item-description')
  }
}]
