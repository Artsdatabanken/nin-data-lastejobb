if (!process.env.DEBUG) process.env.DEBUG = "*"
const { http, log } = require("lastejobb")
const config = require("../../config")
// Laster ned arter fra Artsdatabanken sitt API
http
  .downloadBinary(
    config.datakilde.ar_taxon,
    config.getDataPath(__filename, ".csv")
  )
  .catch(err => {
    log.fatal(err)
  })
