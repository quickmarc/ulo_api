const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const router = express.Router()

// controllers
const auth = require('../controllers/auth')
const user = require('../controllers/user')
const property = require('../controllers/property')
const notification = require('../controllers/notification')


// middleware
const application = require('../middleware/app')
const multer = require('../middleware/multer')
const admin = require('../middleware/admin')
const auth_middleware = require('../middleware/auth')


// cors middleware
router.use(cors())

// parse request body
router.use(bodyParser.json({ strict: false }))
router.use(bodyParser.urlencoded({ extended: false }))


// api default
router.get('/', (req, res, next) => {
  return res.json({ app: process.env.APP_NAME, version: "v1.0.0" })
})

// protect access to API for authorized app
router.use(application)

// authentication
router.post('/auth/register', auth.store)
router.post('/auth/login', auth.login)
router.post('/auth/activate/:user', auth.activate)
router.post('/auth/check', auth.check)

// unauthenticated routes
// router.get('/businesses', business.index)


// give access to next routes to logged users only
router.use(auth_middleware)

// notifications
router.get('/users/:user/notifications', notification.index)

// users routes
router.post('/users', multer, user.store)
router.put('/users/:user', multer, user.update)
router.delete('/users/:user', user.delete)
router.delete('/users/:user/destroy', user.destroy)

// properties routes
router.get('/properties', property.index)
router.get('/users/:user/properties', property.user)
router.post('/properties', multer, property.store)
router.put('/properties/:property', multer, property.update)
router.delete('/properties/:property', property.delete)

// errors handling
router.use((req, res) => {
  return res.status(404).json({ message: "Unable to retrieve the required resource." })
})


module.exports = router