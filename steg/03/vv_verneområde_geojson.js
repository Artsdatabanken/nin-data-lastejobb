const io = require("../../lib/io")
const config = require("../../config")
const log = require("log-less-fancy")()
var shapefile = require("shapefile")
const typesystem = require("@artsdatabanken/typesystem")

// Konverter .shp til .json

let r = {}

function leggTilOmråde(o) {
  const id = o.properties.IID
  const iid = parseInt(id.substring(2)) // VV0000033
  const kode = typesystem.verneområde.leggTilPrefiks(iid)
  r[kode] = o
}

function lagre() {
  io.skrivDatafil(__filename, r)
}

const shpfilePath =
  config.getDataPath("vv_verneområde_shp", "") + "/naturvernomrader_utm33"

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
