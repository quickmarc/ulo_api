const Notification = require('../models/notification')
const User = require('../models/user')
const helpers = require('../utils/helpers')


/**
 * Get given user notifications.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.index = async (req, res) => {
  await User.findById(req.params.user, async (err, user) => {
    if (err) {
      console.error(err)
      helpers.log(err.message, 'error', 'server')
      return res.status(500).json({ message: "Impossible de retrouver le compte utilisateur.", error: err.message })
    }

    if (!user || !user.active || !user.visible)
      return res.status(500).json({ message: "Impossible de récupérer la liste des notifications." })

    const query = { to: req.params.user, seen: false }
    if (req.query.type && req.query.type != '') query.type = req.query.type

    await Notification.find(query, (err, notifications) => {
      if (err) {
        console.error(err)
        helpers.log(err.message, 'error', 'server')
        return res.status(500).json({ message: "Impossible de récupérer la liste des notifications.", error: err.message })
      }

      // mark notifications as seen
      if (req.query.mark && req.query.mark == '1')
        notifications.forEach(async notification => await notification.updateOne({ seen: true }))

      return res.json(notifications)
    })
  })
}