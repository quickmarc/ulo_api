const User = require('../models/user')
const Business = require('../models/business')
const bcrypt = require('bcrypt')
const helpers = require('../utils/helpers')



exports.index = async (req, res) => {
  const filter = req.query
  delete filter['_']

  await User.find(filter, (err, users) => {
    if (err) {
      console.error(err)
      helpers.log()
      return res.status(500).json({ message: "An error occurred, unable to find users.", error: err })
    }

    return res.json(users)
  })
}

/**
 * Get all clients.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.clients = async (req, res) => {
  const query = { admin: false, ...req.query }
  delete query['_']

  await User.find(query, (err, users) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "Unable to find clients.", error: err.message })
    }

    return res.json(users)
  })
}

/**
 * Get all administrators.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.admin = async (req, res) => {
  const query = { admin: true, ...req.query }
  delete query['_']

  await User.find(query, (err, users) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "Unable to find administrators.", error: err.message })
    }

    return res.json(users)
  })
}

/**
 * Get user account information.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.show = async (req, res) => {
  const id = req.params.user

  await User.findById(id).populate(['businesses']).exec((err, user) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "Unable to find user with the given id.", error: err.message })
    }

    return res.json(user)
  })
}

/**
 * Store newly created user.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.store = async (req, res) => {
  const data = req.body

  if (data.password != data.repassword)
    return res.status(500).json({ message: "Passwords are not the same." })

  data.password = bcrypt.hashSync(data.password)

  // profile photo
  const photo = req.files ? req.files['photo'] : null
  if (photo) data.photo = photo[0].path

  const user = new User(data)
  await user.save()

  return res.status(201).json({ message: "User created successfully." })
}

/**
 * Update user account information.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.update = async (req, res) => {
  const id = req.params.user
  const data = req.body

  await User.findById(id, async (err, user) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "Unable to find user with the given id.", error: err.message })
    }

    // lock account if trying to update secured fields
    if (data.businesses || data.beneficiaries || data.admin || data.active || data.visible || data.code) {
      await user.updateOne({ active: false })
      helpers.log(`Unauthorized update. User account ${user._id} disabled.`, 'error', 'action')

      return res.status(403).json({ message: "Update attempt cancelled. Your account has been locked." })
    }

    // accept idcard number creation but deny update
    if (data.idcard && user.idcard)
      return res.status(403).json({ message: "Unable to update defined ID card number." })

    // password update
    if (data.old_password && data.new_password && data.renew_password) {
      if (data.new_password != data.renew_password)
        return res.status(500).json({ message: "New passwords are not the same." })

      if (bcrypt.compareSync(data.old_password, user.password)) {
        if (data.new_password != '')
          data.password = bcrypt.hashSync(data.new_password, bcrypt.genSaltSync())
        else
          return res.status(500).json({ message: "New password format is invalid." })
      } else {
        return res.status(500).json({ message: "The old password is invalid." })
      }
    }

    // profile photo update
    const photo = req.files ? req.files['photo'] : null
    if (photo) data.photo = photo[0].path

    // TODO: delete old profile photo

    await user.updateOne(data, (err, upd) => {
      if (err) {
        console.error(err)
        helpers.log(err.message, 'error', 'server')
        return res.status(500).json({ message: "An error occurred during account update.", error: err.message })
      }

      helpers.log(`User account ${user._id} updated.`, 'info', 'action')

      return res.json({ message: "User account has been updated successfully." })
    })
  })
}

/**
 * Delete user account.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.delete = async (req, res) => {
  await User.findById(req.params.user, async (err, user) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "An error occurred during account delete.", error: err.message })
    }

    await user.updateOne({ visible: false, active: false }, async (err, upd) => {
      if (err) {
        console.error(err)
        helpers.log(err.message, 'error', 'server')
        return res.status(500).json({ message: "An error occurred during account delete.", error: err.message })
      }

      // TODO: also disable user businesses

      helpers.log(`User account ${user._id} deleted.`, 'info', 'action')

      return res.json({ message: "User account has been deleted successfully." })
    })
  })
}

exports.destroy = async (req, res) => {
  await User.findById(req.params.user, async (err, user) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "Unable to find user.", error: err })
    }

    if (user) {
      user.businesses.forEach(async id => {
        await Business.findByIdAndDelete(id)
      })

      await user.deleteOne()
      return res.json({ message: "User deleted successfully." })
    } else {
      return res.status(400).json({ message: "Unable to find user." })
    }
  })
}