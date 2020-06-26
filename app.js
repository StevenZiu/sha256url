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
require("dotenv").config()
var app = express()

const dbConfig = {
  user: "root",
  password: "",
  database: "sha256url",
  host: "localhost",
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
