const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const TestHelper = require('../../../test-helper')
const S3 = require('aws-sdk/clients/s3')
const config = require('../../config')
const Photos = require('./photos')
const Readable = require('stream').Readable

lab.experiment(TestHelper.getFile(__filename), () => {
  const photosConfig = {
    region: 'REGION',
    apiVersion: 'APIVERSION',
    bucket: 'BUCKET'
  }

  lab.before(({ context }) => {
    // Set up the stubs
    context.sandbox = sinon.createSandbox()
    TestHelper.stubCommon(context)
    const { sandbox } = context

    // Stub the environment variable AWS_S3_ENABLED
    sandbox.stub(config, 's3Enabled').value(true)

    // Stub the S3 'upload'
    sandbox.stub(S3.prototype, 'upload').value(({ Key }) => {
      return {
        promise: async () => {
          return { Key }
        }
      }
    })

    // Stubbing the S3 'getObject' proved difficult (it appears to be a dynamically generated function)
    // Instead we've wrapped the S3 call in a function and stubbed that instead.
    sandbox.stub(Photos.prototype, 'createReadStream').value(async () => {
      return new Readable()
    })

    TestHelper.clearCache(context)
  })

  lab.after(async ({ context }) => {
    const { sandbox } = context
    // Restore the sandbox to make sure the stubs are removed correctly
    sandbox.restore()
  })

  // Group of tests for the uploadPhoto() function
  lab.experiment('uploadPhoto', () => {
    lab.test('photo is uploaded', async ({ context }) => {
      const filename = 'testfile.jpg'
      const contentType = 'image/jpeg'
      const readableStream = new Readable()

      const photos = new Photos(photosConfig)
      const result = await photos.uploadPhoto(filename, contentType, readableStream)
      Code.expect(result).to.equal(filename) // The filename passed in will be returned as the Key its stored in S3
    })
  })

  // Group of tests for the getPhotoStream() function
  lab.experiment('getPhotoStream', () => {
    lab.test('gets photo', async ({ context }) => {
      const filename = 'testfile.jpg'

      const photos = new Photos(photosConfig)
      const result = await photos.getPhotoStream(filename)
      Code.expect(result).to.be.an.instanceof(Readable)
    })
  })
})
