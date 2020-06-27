import React, { useEffect, useState } from "react"
import logo from "./logo.svg"
import "./App.scss"
import http from "axios"

function App() {
  const [url, updateUrl] = useState("")
  const [hashedUrls, updateHashedUrls] = useState({
    longHash: "",
    shortHash: "",
  })
  const [error, updateError] = useState("")
  const submitForm = async (event) => {
    event.preventDefault()
    if (url.indexOf("http://") === -1 && url.indexOf("https://") === -1) {
      updateError("Please input full url with https:// or http://")
    } else if (url !== "") {
      await http({
        method: "post",
        url:
          process.env.NODE_ENV === "production"
            ? `${window.location.href}api/shorten`
            : "http://localhost:3000/api/shorten",
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
            updateError("")
          }
        })
        .catch((err) => {
          updateError(err.response.data)
          console.log(err.response.data)
        })
    } else {
      updateError("Please input url")
    }
  }
  return (
    <div className="App">
      <div className="header">
        <p className="title">Welcome to sha256 hash url generator</p>
        <p className="desc">
          Input the url you want to process, we will generate both the long
          sha256 url and short sha256 url
        </p>
      </div>
      <div className="main">
        <form onSubmit={submitForm} className="form">
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
        {hashedUrls.longHash ? (
          <div className="result">
            <div>
              <span>Long URL: </span>
              <a
                href={`${
                  process.env.NODE_ENV === "production"
                    ? `${window.location.href}`
                    : "http://localhost:3000/"
                }${hashedUrls.longHash}`}
                target="_blank"
              >
                {`${
                  process.env.NODE_ENV === "production"
                    ? `${window.location.href}`
                    : "http://localhost:3000/"
                }${hashedUrls.longHash}`}
              </a>
            </div>
            <div>
              <span>short URL: </span>
              <a
                href={`${
                  process.env.NODE_ENV === "production"
                    ? `${window.location.href}`
                    : "http://localhost:3000/"
                }${hashedUrls.shortHash}`}
                target="_blank"
              >{`${
                process.env.NODE_ENV === "production"
                  ? `${window.location.href}`
                  : "http://localhost:3000/"
              }${hashedUrls.shortHash}`}</a>
            </div>
          </div>
        ) : null}
        {error ? <div className="error">{error}</div> : null}
      </div>
    </div>
  )
}

export default App
