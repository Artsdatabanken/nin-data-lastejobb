const io = require("../../lib/io")
const log = require("log-less-fancy")()
var PolygonLookup = require("polygon-lookup")

let kommuner = io.lesDatafil("LAU2_2018", ".geojson")
let vo = io.lesDatafil("vv_verneområde_geojson")

var lookup = new PolygonLookup(kommuner)

let treff = 0
manglerKommune = []

function koblePåKommune(vo) {
  let nater = vo.geometry.coordinates
  while (Array.isArray(nater[0][0])) nater = nater[0]
  //  if (vo.properties.IID === "VV00000171") log.warn(nater)

  let hits = {}
  for (var i = 0; i < nater.length; i++) {
    const punkt = nater[i]
    var poly = lookup.search(punkt[0], punkt[1])
    if (poly) {
      const kommunenummer = poly.properties.LAU_CODE.toString().padStart(4, "0")
      hits[kommunenummer] = 1
      treff++
    }
  }
  vo.properties.kommune = Object.keys(hits)
  //  if (vo.properties.IID === "VV00000171") log.warn(hits)
  if (vo.properties.kommune.length <= 0)
    manglerKommune.push(vo.properties.OMRADENAVN)
}

Object.keys(vo).forEach(iid => {
  const v = vo[iid]
  koblePåKommune(v)
})

const total = Object.keys(vo).length
if (treff < total)
  log.info(`${total - treff} områder ligger utenfor alle kommuner`)

io.skrivDatafil(__filename, vo)
