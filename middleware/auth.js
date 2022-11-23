const jwt = require('jsonwebtoken')
const User = require('../models/user')


/**
 * API Auth Middleware.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports = async (req, res, next) => {
  let token = req.headers.authorization

  if (!token) return res.status(401).json({ message: "Given token is invalid." })
  if (token.startsWith('Bearer ')) token = token.split(' ')[1]

  jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
    if (err)
      return res.status(401).json({ message: "Given token is invalid." })

    await User.findById(decoded._id, async (err, user) => {
      if (err) {
        console.error(err)
        return res.status(401).json({ message: "Given token is invalid." })
      }

      if (!user) return res.status(401).json({ message: "Given token is invalid." })
      if (!user.active || !user.visible) return res.status(401).json({ message: "You don't have permission to execute this query." })

      req.user = user

      next()
    })
  })
}