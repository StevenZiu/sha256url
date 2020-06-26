var express = require("express")
var router = express.Router()
const apiRouter = require("./api")

router.all("*", apiRouter)

module.exports = router
