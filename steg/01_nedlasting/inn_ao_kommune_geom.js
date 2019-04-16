const http = require("../../lib/http")
const config = require("../../config")
const log = require("log-less-fancy")()

// Laster ned geometri for kommuner i geojson format
http
  .downloadBinary2File(
    "https://nedlasting.geonorge.no/geonorge/Basisdata/Kommuner/GeoJSON/Basisdata_0000_Norge_25833_Kommuner_GEOJSON.zip",
    config.getDataPath(__filename, ".zip")
  )
  .catch(err => {
    log.fatal(err)
  })
