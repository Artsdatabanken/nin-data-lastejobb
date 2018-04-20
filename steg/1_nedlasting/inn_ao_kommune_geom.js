const http = require("../../lib/http")
const config = require("../../config")
const log = require("log-less-fancy")()

// Laster ned geometri for kommuner i geojson format
http
  .downloadJson2File(
    config.datakilde.AO_kommune_geom,
    config.getDataPath(__filename)
  )
  .catch(err => {
    log.fatal(err)
  })
