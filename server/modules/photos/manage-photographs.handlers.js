const Joi = require('@hapi/joi')
const { Item } = require('ivory-data-mapping').cache

class ManagePhotographHandlers extends require('defra-hapi-handlers') {
  get Item () {
    return Item
  }

  get fieldname () {
    return 'photos-what-next'
  }

  get schema () {
    return Joi.object({
      [this.fieldname]: Joi.required()
    })
  }

  get errorMessages () {
    return {
      [this.fieldname]: {
        'any.required': 'You must select what to do next'
      }
    }
  }

  // Overrides parent class handleGet
  async handleGet (request, h, errors) {
    const { photos = [] } = await this.Item.get(request) || {}

    const photosSummaryList = photos.map(({ filename, rank }) => {
      return {
        key: {
          classes: 'your-photos-key',
          text: `Photo ${rank + 1}`
        },
        value: {
          classes: 'your-photos-value',
          html: `<img class="your-photos-img" src="/photos/medium/${filename}" />`
        },
        actions: {
          classes: 'your-photos-actions',
          items: [
            // {
            //   href: `/remove-photo/${filename}`,
            //   text: 'Remove',
            //   visuallyHiddenText: `Photo ${rank + 1}`
            // }
          ]
        }
      }
    })

    this.viewData = { photosSummaryList, maxPhotos: 6 }
    return super.handleGet(request, h, errors)
  }

  async addPhotographs (request) {
    const option = request.payload[this.fieldname]
    return (option === 'add-photos')
  }

  // Overrides parent class handlePost
  async handlePost (request, h) {
    if (!this.addPhotographs(request)) {
      const item = await this.Item.get(request) || {}
      const { photos } = item

      photos.forEach((photo) => {
        photo.confirmed = true
      })

      await this.Item.set(request, item)
    }

    return super.handlePost(request, h)
  }
}

module.exports = ManagePhotographHandlers
