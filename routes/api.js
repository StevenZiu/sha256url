const express = require("express")
const router = express.Router()
const sha256 = require("sha256")

router.get("/health", (req, res, next) => {
  res.status(200).send("api is up")
})

router.post("/shorten", (req, res) => {
  const { url } = req.body
  // check duplicate
  const checkDuplicateQuery = `select * from hashlinks where original_url='${url}'`
  req.app.dbInstance.query(checkDuplicateQuery, (err, results) => {
    if (err) {
      console.error(err.message)
      res.status(500).send("server error")
      return
    } else if (results.length > 0) {
      res.status(400).send("url has already been shorten")
      return
    }
    // start shorten
    const longHash = sha256(url)
    const shortHash = longHash.substr(0, 4)
    const query = `insert into hashlinks (original_url, long_hash, short_hash) values ('${url}', '${longHash}', '${shortHash}')`
    req.app.dbInstance.query(query, (err, results) => {
      if (err) {
        console.error(err.message)
        res.status(500).send("server error")
        return
      }
      res.status(200).send({ longHash, shortHash })
    })
  })
})

router.post("/original", (req, res) => {
  const { type, hash } = req.body
  console.log(hash)
  const checkExistingQuery = `select * from hashlinks where ${
    type === "long" ? "long_hash" : "short_hash"
  }='${hash}'`
  req.app.dbInstance.query(checkExistingQuery, (err, results) => {
    if (err) {
      res.status(500).send("server error")
      console.error(err.message)
    } else if (results.length > 0) {
      res.status(200).send(results[0].original_url)
    } else {
      res.status(400).send("url does not exist")
    }
  })
})

module.exports = router
