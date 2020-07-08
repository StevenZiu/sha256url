var createError = require("http-errors")
var express = require("express")
var path = require("path")
var cookieParser = require("cookie-parser")
var logger = require("morgan")
var indexRouter = require("./routes/index")
const helmet = require("helmet")
const cors = require("cors")
const mysql = require("mysql")
const bodyParser = require("body-parser")
const fs = require("fs")
const slowDown = require("express-slow-down")

require("dotenv").config()
var app = express()
const speedLimiter = slowDown({
  windowMs: 5 * 60 * 1000, // 5 minutes
  delayAfter: 10, // allow 10 requests per 5 minutes, then...
  delayMs: 1000 * 60 * 1, // begin adding 1min of delay per request above 5:
  // request # 101 is delayed by 1min
  // request # 102 is delayed by 2min
  // request # 103 is delayed by 3min
  // etc.
})
app.use(speedLimiter)
const dbConfig = {
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "sha256url",
  host: process.env.DB_HOST || "localhost",
  socketPath: process.env.DB_SOCKET || "",
}

const dbConnection = mysql.createConnection(dbConfig)

dbConnection.connect((err) => {
  if (err) {
    console.error(err.message)
    return
  }
  console.log("db is online")
  // attach to app
  app.dbInstance = dbConnection
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(helmet())
app.use(cors())

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "jade")

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
// app.use(express.static(path.join(__dirname, "public")))

app.use("/api", indexRouter)

// redirect shorten url to original one
app.get("/:hash", (req, res) => {
  const hash = req.params.hash
  const checkExistingQuery = `select * from hashlinks where ${
    hash.length > 4 ? "long_hash" : "short_hash"
  }='${hash}'`
  req.app.dbInstance.query(checkExistingQuery, (err, results) => {
    if (err) {
      res.status(500).send("server error")
      console.error(err.message)
    } else if (results.length > 0) {
      // res.status(200).send(results[0].original_url)
      res.redirect(results[0].original_url)
    } else {
      res.status(400).send("url does not exist")
    }
  })
})
// check build folder existing
if (!fs.existsSync("./client/build")) {
  console.error("client build app does not exist")
} else {
  // serve client as static
  app.use(express.static(path.join(__dirname, "./client/build")))
  // route to client code
  app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "./client/build", "index.html"))
  })
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render("error")
})

module.exports = app
