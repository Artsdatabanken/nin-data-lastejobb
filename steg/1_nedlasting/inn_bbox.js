const http = require("../../lib/http")
const config = require("../../config")
const log = require("log-less-fancy")()

// TEMP TODO HACK - hydra cert invalid
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"

// Laster ned bounding bokser for koder
// PS: Denne inneholder kun de eksakte kodene med data på, dvs. at det må propageres og slås sammen oppover treet.
http
  .downloadJson2File(config.datakilde.bbox, config.getDataPath(__filename))
  .catch(err => {
    log.fatal(err)
  })
