const User = require('../models/user')
const Property = require('../models/property')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const helpers = require('../utils/helpers')
const mailer = require('../utils/mailer')
const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)


/**
 * Create new user.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.store = async (req, res) => {
  const data = req.body

  const exists = await User.findOne({ phone: data.phone })
  if (exists) return res.status(500).json({ message: "An user with the same phone number already exists." })

  if (data.password != data.repassword) return res.status(400).json({ message: "Passwords does not match." })

  // hash activation code & password
  const code = helpers.randomCode(6)
  data.code = bcrypt.hashSync(code, bcrypt.genSaltSync())
  data.password = bcrypt.hashSync(data.password || "", bcrypt.genSaltSync())

  const user = new User(data)
  await user.save(async (err, stored) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "An error occurred during user account creation.", error: err.message })
    }

    // use twilio otp to send sms activation
    await twilio.verify.v2.services(process.env.TWILIO_SERVICE_SID)
      .verifications
      .create({ to: user.phone, channel: 'sms' })
      .then((verification) => console.log("Twilio verification status: " + verification.status))
      .catch((err) => console.error(err))

    // send welcome email
    if (user.email) {
      const email = mailer.parseEmail('new_account', { PHONE: data.phone, PASSWORD: code })
      await mailer.sendMail(user.email, 'Account created on Quickdo Application Market', email)
        .catch(err => {
          console.error(err)
          helpers.log(err.message, 'error', 'server')
        })
    }

    // welcome notification
    const body = `Your account was successfully created. Now you can buy everything you want and send it to who you want in one tap.`
    await helpers.notify(user._id, 'Welcome on Quickdo Application Market', body)

    helpers.log(`New user account created with id ${user._id}`, 'info', 'server')

    return res.status(201).json({ message: "Account created successfully. You'll receive your activation code on your phone number.", user: user, id: user._id })
  })
}

/**
 * Login user with the given credentials.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.login = async (req, res) => {
  const credentials = req.body

  await User.findOne({ phone: credentials.phone }, async (err, user) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "Unable to find user with the given phone number.", error: err.message })
    }

    if (!user) return res.status(401).json({ message: "Phone number or password are invalid." })

    if (!user.active || !user.visible)
      return res.status(401).json({ message: "Your account is disabled, check your inbox for activation sms or contact our support." })

    bcrypt.compare(credentials.password, user.password, async (err, same) => {
      if (err) {
        console.error(err)
        helpers.log(err.message, 'error', 'server')
        return res.status(401).json({ message: "Phone number or password are invalid.", error: err.message })
      }

      if (!same) return res.status(401).json({ message: "Phone number or password are invalid." })

      const payload = { _id: user._id, first_name: user.first_name, last_name: user.last_name, phone: user.phone, email: user.email, country: user.country, city: user.city, address: user.address, photo: user.photo }
      const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '2d' })
      const properties = await Property.find({ owner: user._id, active: true })

      helpers.log(`New token issued for ${payload._id}`, 'info', 'server')

      return res.json({ token: token, user: payload, properties: properties })
    })
  })
}

/**
 * Check user token.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.check = async (req, res) => {
  const token = req.body.token

  jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(401).json({ message: "Invalid token.", error: err.message })
    }

    await User.findById(decoded._id, async (err, user) => {
      if (err) {
        console.error(err)
        helpers.log(err.message, 'error', 'server')
        return res.status(500).json({ message: "Unable to find user with the given id.", error: err.message })
      }

      if (!user) return res.status(401).json({ message: "Invalid token." })
      if (!user.active) return res.status(401).json({ message: "Your account is disabled." })

      const payload = { _id: user._id, first_name: user.first_name, last_name: user.last_name, phone: user.phone, email: user.email, country: user.country, city: user.city, address: user.address, photo: user.photo }
      const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '2d' })
      const properties = await Property.find({ owner: user._id, active: true })

      helpers.log(`New token issued for ${payload._id}`, 'info', 'server')

      return res.json({ token: token, user: payload, properties: properties })
    })
  })
}

/**
 * Activate user account.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.activate = async (req, res) => {
  const id = req.params.user

  if (!req.body.code)
    return res.status(401).json({ message: "Invalid activation code provided." })

  await User.findById(id, async (err, user) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "Unable to activate the given account.", error: err.message })
    }

    if (user) {
      // use twilio otp verification feature to activate user account
      twilio.verify.v2.services(process.env.TWILIO_SERVICE_SID)
        .verificationChecks
        .create({ to: user.phone, code: req.body.code })
        .then(async (verification) => {
          if (verification.status == 'approved') {
            await user.updateOne({ active: true })
            helpers.log(`User account ${user._id} activated`, 'info', 'server')

            const payload = { _id: user._id, first_name: user.first_name, last_name: user.last_name, phone: user.phone, email: user.email, country: user.country, city: user.city, address: user.address, photo: user.photo }
            const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '2d' })

            helpers.log(`New token issued for ${payload._id}`, 'info', 'server')

            return res.json({ message: "User account activated successfully.", token: token, user: payload })
          } else {
            return res.status(401).json({ message: "Invalid activation code provided." })
          }
        })
        .catch((err) => {
          console.error(err)
          return res.status(500).json({ message: "Unable to verify the user account.", error: err })
        })
    } else {
      return res.status(500).json({ message: "Unable to find the given user." })
    }
  })
}

/**
 * Toggle user admin status.
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.admin = async (req, res) => {
  await User.findById(req.params.user, async (err, user) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ message: "An error occurred, unable to update user.", error: err })
    }

    if (user) {
      const isAdmin = user.admin
      await user.updateOne({ admin: !isAdmin })

      return res.json({ message: "User status updated successfully.", isAdmin: !isAdmin })
    } else {
      return res.status(400).json({ message: "Unable to find user." })
    }
  })
}