const jwt = require('jsonwebtoken')
const User = require('../models/user')


/**
 * API Admin Middleware.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports = async (req, res, next) => {
  if (!req.user.admin)
    return res.status(401).json({ message: "Only administrators can do this." })

  next()
}