const http = require("../../lib/http")
const config = require("../../config")
const log = require("log-less-fancy")()

// Laster ned verneområder fra Miljødirektoratet
// Zip-fil med Shapeformat på innsiden
http
  .downloadBinary2File(
    config.datakilde.vv_verneområe,
    config.getDataPath(__filename, ".zip")
  )
  .catch(err => {
    log.fatal(err)
  })
