const Property = require('../models/property')
const User = require('../models/user')
const helpers = require('../utils/helpers')


/**
 * Find properties.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.index = async (req, res) => {
  const query = { active: true, ...req.query }
  delete query['_']

  await Property.find(query, (err, properties) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "Unable to find properties.", error: err.message })
    }

    return res.json(properties)
  })
}

/**
 * Find property.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.show = async (req, res) => {
  await Property.findById(req.params.property, (err, property) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "Unable to find properties.", error: err.message })
    }

    return res.json(property)
  })
}

/**
 * Find user properties.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.user = async (req, res) => {
  const id = req.params.user

  if (!req.user.admin && id != req.user._id)
    return res.status(401).json({ message: "You can only view your properties." })

  await User.findById(id, async (err, user) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "Unable to find the given user.", error: err.message })
    }

    await Property.find({ owner: user._id, active: true }, (err, properties) => {
      if (err) {
        console.error(err)
        helpers.log(err.message, 'error', 'server')
        return res.status(500).json({ message: "Unable to find user properties.", error: err.message })
      }

      return res.json(properties)
    })
  })
}

/**
 * Add new property to given user.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.store = async (req, res) => {
  const id = req.params.user
  const data = req.body

  if (!req.user.admin && id != req.user._id)
    return res.status(401).json({ message: "You can only create your properties." })

  await User.findById(id, async (err, user) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "Unable to find user with the given id.", error: err.message })
    }

    if (user) {
      if (user.properties && user.properties.length >= 3)
        return res.status(403).json({ message: "Maximum properties authorized reached. Delete one of your property or subscribe to another plan." })

      data.owner = id
      const property = new Property(data)

      await property.save(async (err, stored) => {
        if (err) {
          console.error(err)
          helpers.log(err.message, 'error', 'server')
          return res.status(500).json({ message: "Unable to create new property. ", error: err.message })
        }

        user.properties ? user.properties.push(property._id) : user.properties = [property._id]
        await user.save()

        helpers.log(`Property ${property._id} added to ${id}.`, 'info', 'action')

        return res.status(201).json({ message: "New property added successfully. We'll review your property data before you can process with your customers orders." })
      })
    } else {
      return res.status(500).json({ message: "Unable to find user with the given id." })
    }
  })
}

/**
 * Update the given property.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.update = async (req, res) => {
  const id = req.params.property
  const data = req.body

  // deny status update
  if (data.active || data.verified) {
    await Property.findByIdAndUpdate(id, { active: false, verified: false })
    return res.status(401).json({ message: "You can't update property status." })
  }

  // get logo if set
  const logo = req.files ? req.files['logo'] : null
  if (logo) data.logo = logo[0].path

  await Property.findById(id, async (err, property) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "Unable to find property with the given id.", error: err.message })
    }

    // only owner can update his property
    if (property.owner.toString() != req.user._id.toString())
      return res.status(401).json({ message: "Unable to update, you aren't the owner of the property." })

    await property.updateOne(data)
    helpers.log(`Property ${id} updated.`, 'info', 'action')

    return res.json({ message: "Property updated successfully." })
  })
}

/**
 * Toggle property active state.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.toggle = async (req, res) => {
  const id = req.params.property

  await Property.findById(id, async (err, property) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "Unable to find property with the given id.", error: err.message })
    }

    await property.updateOne({ active: !property.active })
    helpers.log(`Property ${id} active status changed to ${!property.active}.`, 'info', 'action')

    return res.json({ message: "Property status updated successfully.", active: !property.active })
  })
}

/**
 * Toggle property verification state.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.verify = async (req, res) => {
  const id = req.params.property

  await Property.findById(id, async (err, property) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "Unable to find property with the given id.", error: err.message })
    }

    await property.updateOne({ verified: !property.verified })
    helpers.log(`Property ${id} verification status changed to ${!property.verified}.`, 'info', 'action')

    return res.json({ message: "Property verification updated successfully.", verified: !property.verified })
  })
}

/**
 * Delete the given property.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.delete = async (req, res) => {
  const id = req.params.property

  await Property.findById(id, async (err, property) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "Unable to find property with the given id.", error: err.message })
    }

    // // only owner can delete his property
    // if (property.owner != req.user._id)
    //   return res.status(401).json({ message: "Unable to delete the property, you aren't the owner of the property." })

    // deny delete if property has catalog
    if (property.services.length > 0 || property.products.length > 0)
      return res.status(500).json({ message: "The given property has services or products in her catalog. Unable to delete." })


    await property.deleteOne()
    helpers.log(`Property ${id} deleted.`, 'info', 'action')

    return res.json({ message: "Property deleted successfully." })
  })
}