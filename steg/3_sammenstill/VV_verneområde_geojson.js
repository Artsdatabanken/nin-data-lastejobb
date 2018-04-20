const io = require("../../lib/io")
const config = require("../../config")
const log = require("log-less-fancy")()
var shapefile = require("shapefile")

let r = {}

function leggTilOmråde(o) {
  const id = o.properties.IID
  log.info(id)
  log.debug(o)
  r[id] = o
}

function lagre() {
  io.skrivDatafil(__filename, r)
}

const shpfilePath =
  config.getDataPath("VV_verneområde_shp", "") + "/naturvernomrader_utm33"
shapefile
  .open(shpfilePath)
  .then(source =>
    source.read().then(function importerOmråde(result) {
      if (result.done) {
        lagre()
        return
      }
      leggTilOmråde(result.value)
      return source.read().then(importerOmråde)
    })
  )
  .catch(error => {
    log.error(error.stack)
    process.exit(1)
  })
