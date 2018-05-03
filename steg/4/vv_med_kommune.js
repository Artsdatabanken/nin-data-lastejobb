const io = require("../../lib/io")
const log = require("log-less-fancy")()
var PolygonLookup = require("polygon-lookup")

let kommuner = io.lesDatafil("inn_ao_kommune_geom")
let vo = io.lesDatafil("vv_verneområde_geojson")

var lookup = new PolygonLookup(kommuner)

let treff = 0

function koblePåKommune(vo) {
  const nater = vo.geometry.coordinates[0]
  let hits = {}
  for (var i = 0; i < nater.length; i++) {
    const punkt = nater[i]
    var poly = lookup.search(punkt[0], punkt[1])
    if (poly) {
      const kommunenummer = poly.id.toString().padStart(4, "0")
      hits[kommunenummer] = 1
      treff++
    }
  }
  vo.properties.kommune = Object.keys(hits)
  if (vo.properties.kommune.length <= 0)
    log.warn(
      "Fant ikke kommune for",
      vo.properties.IID,
      vo.properties.OMRADENAVN
    )
}

Object.keys(vo).forEach(iid => {
  const v = vo[iid]
  koblePåKommune(v)
})

log.info(`${treff} av ${Object.keys(vo).length} ligger innenfor en kommune`)
io.skrivDatafil(__filename, vo)