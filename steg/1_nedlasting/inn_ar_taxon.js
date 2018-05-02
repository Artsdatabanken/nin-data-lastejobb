if (!process.env.DEBUG) process.env.DEBUG = "*"
const path = require("path")
const http = require("../../lib/http")
const config = require("../../config")
const log = require("log-less-fancy")()

// Laster ned arter fra Artsdatabanken sitt API
http
  .downloadBinary2File(
    config.datakilde.ar_taxon,
    config.getDataPath(__filename, ".csv")
  )
  .catch(err => {
    log.fatal(err)
  })
