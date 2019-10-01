const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const TestHelper = require('../../../test-helper')
const S3 = require('aws-sdk/clients/s3')
const config = require('../../config')
const photos = require('./photos')
const Readable = require('stream').Readable

lab.experiment(TestHelper.getFile(__filename), () => {
  let sandbox

  lab.before(() => {
    // Set up the stubs
    sandbox = sinon.createSandbox()
    TestHelper.stubCommon(sandbox)
    sandbox.stub(config, 's3Enabled').value(true)

    sandbox.stub(S3.prototype, 'upload').value(({ Key }) => {
      return {
        promise: async () => {
          return { Key }
        }
      }
    })

    sandbox.stub(photos, 'createReadStream').value(async () => {
      return new Readable()
    })
  })

  lab.after(async () => {
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  // Group of tests for the uploadPhoto() function
  lab.experiment('uploadPhoto', () => {
    lab.test('upload is successful', async ({ context }) => {
      const filename = 'testfile.jpg'
      const contentType = 'image/jpeg'
      const readableStream = new Readable()

      const result = await photos.uploadPhoto(filename, contentType, readableStream)
      Code.expect(result).to.equal(filename) // The filename passed in will be returned as the Key its stored in S3
    })
  })

  // Group of tests for the getPhotoStream() function
  lab.experiment('getPhotoStream', () => {
    lab.test('gets photo', async ({ context }) => {
      const filename = 'testfile.jpg'
      const result = await photos.getPhotoStream(filename)
      Code.expect(result).to.be.an.instanceof(Readable)
    })
  })
})
