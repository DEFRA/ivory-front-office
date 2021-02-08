const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = exports.lab = Lab.script()
const sinon = require('sinon')
const { logger } = require('defra-logging-facade')
const S3 = require('aws-sdk/clients/s3')
const Photos = require('./photos')
const fs = require('fs')

lab.experiment('defra-hapi-photos', () => {
  let photosConfig

  lab.before(({ context }) => {
    // Set up the shared stubs
    context.sandbox = sinon.createSandbox()
    // TestHelper.stubCommon(context.sandbox)

    photosConfig = {
      region: 'REGION',
      apiVersion: 'APIVERSION',
      bucket: 'BUCKET',
      alternativeSizes: [
        { width: 200, height: 200, type: 'small' },
        { width: 400, height: 400, type: 'medium' }
      ]
    }

    context.sandbox.stub(logger, 'info').value(() => undefined)
    context.sandbox.stub(logger, 'error').value(() => undefined)

    // Stub and spy s3.upload
    context.sandbox.uploadStub = context.sandbox.stub(S3.prototype, 'upload').value(({ Key }) => {
      return {
        promise: async () => { return { Key } }
      }
    })
    context.sandbox.uploadStubSpy = sinon.spy(S3.prototype, 'upload')

    // Stub S3 makeRequest (The S3 'getObject' nor 'deleteObject' functions could not be directly stubbed as they appear dynamically generated functions.  This works around the issue.)
    context.sandbox.makeRequest = context.sandbox.stub(S3.prototype, 'makeRequest')

    // Stub s3.getObject
    context.sandbox.makeRequest.withArgs('getObject').callsFake(() => {
      return {
        promise: async () => {
          return { ContentType: 'image/jpeg', Body: 'qwerty' }
        }
      }
    })

    // Stub s3.deleteObject
    context.sandbox.makeRequest.withArgs('deleteObject').callsFake(() => {
      return {
        promise: async () => { /* only returns something on error (with our current S3 setup) */ }
      }
    })
  })

  lab.after(async ({ context }) => {
    context.sandbox.restore() // Restore the sandbox to make sure the stubs are removed correctly
  })

  // Group of tests for the upload() function
  lab.experiment('upload', () => {
    lab.beforeEach(({ context }) => {
      // Setup the upload parameters (to avoid doing it in every test). It's in beforeEach() to ensure the read stream is fresh for every test
      const filename = 'photos.test.examplePhoto.jpg'
      const contentType = 'image/jpeg'
      const file = `${__dirname}/${filename}`
      const readStream = fs.createReadStream(file)
      context.sandbox.uploadParams = { filename, contentType, readStream }
    })

    lab.afterEach(({ context }) => {
      context.sandbox.uploadParams.readStream.destroy() // Tidy up the read stream
    })

    lab.test('single photo is uploaded', async ({ context }) => {
      const { uploadParams } = context.sandbox
      const photos = new Photos(photosConfig)
      const key = await photos._uploadToS3(uploadParams.filename, uploadParams.contentType, uploadParams.readStream)

      Code.expect(key).to.equal(uploadParams.filename)
    })

    lab.test('photo group is uploaded (including all alternative sizes)', async ({ context }) => {
      const { uploadParams } = context.sandbox
      const photos = new Photos(photosConfig)
      context.sandbox.uploadStubSpy.resetHistory() // reset the spy so previous tests don't affect it
      await photos.upload(uploadParams.filename, uploadParams.contentType, uploadParams.readStream)
        .catch(error => {
          Code.fail(`This should not error with: ${error}`)
        })

      const numberOfUploads = 1 + Object.values(photos.alternativeSizes).length // The original and the alternative sizes
      Code.expect(context.sandbox.uploadStubSpy.callCount).to.equal(numberOfUploads)
    })

    lab.test('a size within the photo group fails to upload', async ({ context }) => {
      // Override the S3 'upload' stub with one that will fail on the second call (The sinon stub.onCall(n) function should do this, but was proving tricky to use alongside returning the promise)
      let counter = 0
      const failOnSecondCallStub = ({ Key }) => {
        return {
          promise: async () => {
            counter++
            if (counter === 2) { throw new Error('upload failed from stub') }
            return { Key }
          }
        }
      }
      context.sandbox.uploadStub.value(failOnSecondCallStub)

      // Trigger upload
      let errorToCheck = false
      const { uploadParams } = context.sandbox
      const photos = new Photos(photosConfig)
      await photos.upload(uploadParams.filename, uploadParams.contentType, uploadParams.readStream)
        .catch(error => {
          errorToCheck = error
        })
      Code.expect(errorToCheck).to.be.an.error('upload failed from stub')
    })

    lab.test('all sizes within the photo group fail to upload', async ({ context }) => {
      // Override the S3 'upload' stub with one that will throw an error
      context.sandbox.stub(S3.prototype, 'upload').throws(new Error('upload failed from stub'))

      // Trigger upload
      let errorToCheck = false
      const { uploadParams } = context.sandbox
      const photos = new Photos(photosConfig)
      await photos.upload(uploadParams.filename, uploadParams.contentType, uploadParams.readStream)
        .catch(error => {
          errorToCheck = error
        })
      Code.expect(errorToCheck).to.be.an.error('upload failed from stub')
    })

    lab.test('an alternative size photo upload is delayed', async ({ context }) => {
      // This should test that all the write streams receive the full read stream even if one is delayed (Ideally this would measure the size of the input object and compare it to the stubbed write objects.)
      // Override the S3 'upload' stub with one that will be delayed on the second call
      let counter = 0
      const delayedStub = ({ Key }) => {
        return {
          promise: async () => {
            counter++
            if (counter === 2) { sleep(1000) }
            return { Key }
          }
        }
      }
      function sleep (milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
      }
      context.sandbox.uploadStub.value(delayedStub)

      // Trigger upload
      const { uploadParams } = context.sandbox
      const photos = new Photos(photosConfig)
      await photos.upload(uploadParams.filename, uploadParams.contentType, uploadParams.readStream)
        .catch(error => {
          Code.fail(`This should not error with: ${error}`)
        })
    })
  })

  // Group of tests for the get() function
  lab.experiment('get', () => {
    lab.afterEach(() => {
      photosConfig.enabled = true
    })

    lab.test('gets photo - original', async () => {
      const filename = 'testfile.jpg'
      const size = 'original'
      photosConfig.enabled = false
      const photos = new Photos(photosConfig)
      const result = await photos.get(filename, size)
      Code.expect(result.Body).to.exist()
      Code.expect(result.ContentType).to.equal('image/jpeg')
    })

    lab.test('gets photo - original - when s3 is disabled ', async () => {
      const filename = 'testfile.jpg'
      const size = 'original'
      const photos = new Photos(photosConfig)
      const result = await photos.get(filename, size)
      Code.expect(result.Body).to.exist()
      Code.expect(result.ContentType).to.equal('image/jpeg')
    })

    lab.test('gets photo - alternative size', async () => {
      const photos = new Photos(photosConfig)
      const result = await photos.get('testfile.jpg', 'small')
      Code.expect(result.Body).to.exist()
      Code.expect(result.ContentType).to.equal('image/jpeg')
    })

    lab.test('size not requested', async () => {
      const photos = new Photos(photosConfig)
      let errorToCheck = false
      await photos.get('testfile.jpg') // Size not passed to function
        .catch(error => {
          errorToCheck = error
        })
      Code.expect(errorToCheck).to.be.an.error('An invalid photo size requested.')
    })

    lab.test('invalid size requested', async () => {
      const photos = new Photos(photosConfig)
      let errorToCheck = false
      await photos.get('testfile.jpg', 'invalidsize')
        .catch(error => {
          errorToCheck = error
        })
      Code.expect(errorToCheck).to.be.an.error('An invalid photo size requested.')
    })

    lab.test('s3 fails to get photo', async ({ context }) => {
      // Override the stub to throw an error
      context.sandbox.makeRequest.withArgs('getObject').throws(new Error('upload failed from stub'))

      const photos = new Photos(photosConfig)
      let errorToCheck = false
      await photos.get('testfile.jpg', 'original')
        .catch(error => {
          errorToCheck = error
        })
      Code.expect(errorToCheck).to.be.an.error('upload failed from stub')
    })
  })

  // Group of tests for the deleteObject() function
  lab.experiment('deleteObject', () => {
    lab.test('a single photo is deleted', async () => {
      const photos = new Photos(photosConfig)
      await photos._deleteFromS3('testfile.jpg')
        .catch(error => {
          Code.fail(`This should not error with: ${error}`)
        })
    })

    lab.test('photo group is deleted (including all alternative sizes)', async () => {
      const photos = new Photos(photosConfig)
      await photos.delete('testfile.jpg')
        .catch(error => {
          Code.fail(`This should not error with: ${error}`)
        })
    })

    lab.test('a single photo delete throws an error', async ({ context }) => {
      // Override the stub to throw an error
      context.sandbox.makeRequest.withArgs('deleteObject').throws(new Error('upload failed from stub'))

      const photos = new Photos(photosConfig)
      let errorToCheck = false
      await photos._deleteFromS3('testfile.jpg')
        .catch(error => {
          errorToCheck = error
        })
      Code.expect(errorToCheck).to.be.an.error('upload failed from stub')
    })

    lab.test('a size within the photo group fails to delete', async ({ context }) => {
      // Override the stub with one that will be fail on the second call
      let counter = 0
      const failOnSecondCallStub = () => {
        return {
          promise: async () => {
            counter++
            if (counter === 2) { throw new Error('upload failed from stub') }
            // Nothing to return
          }
        }
      }
      context.sandbox.makeRequest.withArgs('deleteObject').callsFake(failOnSecondCallStub)

      // Invoke call
      const photos = new Photos(photosConfig)
      let errorToCheck = false
      await photos.delete('testfile.jpg')
        .catch(error => {
          errorToCheck = error
        })
      Code.expect(errorToCheck).to.be.an.error('upload failed from stub')
    })

    lab.test('all sizes within the photo group fail to delete', async ({ context }) => {
      // Override the stub to throw an error
      context.sandbox.makeRequest.withArgs('deleteObject').throws(new Error('upload failed from stub'))

      const photos = new Photos(photosConfig)
      let errorToCheck = false
      await photos.delete('testfile.jpg')
        .catch(error => {
          errorToCheck = error
        })
      Code.expect(errorToCheck).to.be.an.error('upload failed from stub')
    })
  })
})
