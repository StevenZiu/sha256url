import React, { useEffect, useState } from "react"
import logo from "./logo.svg"
import "./App.css"
import http from "axios"

function App() {
  const [url, updateUrl] = useState("")
  const [hashedUrls, updateHashedUrls] = useState({
    longHash: "",
    shortHash: "",
  })
  const submitForm = async (event) => {
    event.preventDefault()
    if (url !== "") {
      await http({
        method: "post",
        url: "http://localhost:3000/api/shorten",
        headers: {
          "Content-Type": "application/json",
        },
        data: { url },
      })
        .then((res) => {
          if (res.status === 200) {
            console.log(res.data)
            updateHashedUrls({
              longHash: res.data.longHash,
              shortHash: res.data.shortHash,
            })
          }
        })
        .catch((err) => {
          console.log(err.response.data)
        })
    }
  }
  return (
    <div className="App">
      <form onSubmit={submitForm}>
        <label htmlFor="url">Url to process:</label>
        <input
          id="url"
          type="text"
          name="url"
          onChange={(event) => {
            event.preventDefault()
            updateUrl(event.target.value)
          }}
        />
        <button type="submit" value="submit">
          Go
        </button>
      </form>
      <div>{hashedUrls.longHash}</div>
      <div>{hashedUrls.shortHash}</div>
    </div>
  )
}

export default App
