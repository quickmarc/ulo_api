// server
require('dotenv').config()  // load .env
const http = require("http")
const helpers = require('./utils/helpers')
const app = require("./app")

const normalizePort = (val) => {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    return val
  }
  if (port >= 0) {
    return port
  }
  return false
}

const port = normalizePort(process.env.PORT || "3000")
app.set("port", port)

const errorHandler = (error) => {
  if (error.syscall !== "listen") {
    throw error
  }
  const address = server.address()
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.")
      process.exit(1)
      break
    case "EADDRINUSE":
      console.error(bind + " is already in use.")
      process.exit(1)
      break
    default:
      throw error
  }
}

const server = http.createServer(app)
server.on("request", (req, res) => {
  const address = req.socket.address()
  const log = `${address.address}:${address.port} [${req.method}] ${req.originalUrl} - ${res.statusCode}`

  helpers.log(log, res.statusCode == 200 || res.statusCode == 201 ? 'info' : 'error', 'request')
})

server.on("error", errorHandler)
server.on("listening", () => {
  const address = server.address()
  const bind = typeof address === "string" ? "pipe " + address : "port " + port
  console.log("Listening on " + bind)
})

server.listen(port)
