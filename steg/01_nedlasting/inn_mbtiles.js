const http = require("../../lib/http")
const config = require("../../config")
const log = require("log-less-fancy")()

// TEMP TODO HACK - hydra cert invalid
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"

// Laster ned bounding bokser for koder
http
  .downloadJson2File(config.datakilde.mbtiles, config.getDataPath(__filename))
  .catch(err => {
    log.fatal(err)
  })
