module.exports = (req, res, next) => {
  const app_key = process.env.APP_KEY
  const request_key = req.headers['application-key']

  if (request_key != app_key)
    return res.status(401).json({ message: "You don't have required permissions. Contact your administrator." })

  next()
}