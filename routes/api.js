const express = require("express")
const router = express.Router()
const sha256 = require("sha256")

router.get("/health", (req, res, next) => {
  res.status(200).send("api is up")
})

// shorten url
router.post("/shorten", (req, res) => {
  const { url } = req.body
  console.log(url)
  if (!url) {
    res.status(400).send("url is not valid")
    return
  }
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

// get original url
router.get("/:hash", (req, res) => {
  const hash = req.params.hash
  console.log(hash)
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

module.exports = router
