const express = require('express')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const mongoose = require('mongoose')
const helpers = require('./utils/helpers')
const app = express()


// routes files
const api = require('./routes/api')


// database connection
mongoose
  .connect(process.env.DEBUG_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB"))
  .catch((error) => console.error(error))


// session settings
app.use(cookieParser(process.env.SESSION_SECRET))
app.use(session({
  key: 'user_sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { expires: new Date(Date.now() + (3600000 * 2)) }
}))

// TODO: only necessary on webapp, remove
app.use((req, res, next) => {
  res.locals.user = req.session.user
  next()
})


// serve static files
app.use('/upload', express.static('upload'))

// check if user cookie exists while there's no user in session
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user)
    res.clearCookie('user_sid')

  next()
})

// load routes
app.use('/api', api)



module.exports = app