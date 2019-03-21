const http = require("../../lib/http")
const config = require("../../config")
const log = require("log-less-fancy")()

// Laster ned bounding bokser for koder
http
  .downloadJson2File(config.datakilde.filindeks, config.getDataPath(__filename))
  .catch(err => {
    log.fatal(err)
  })
