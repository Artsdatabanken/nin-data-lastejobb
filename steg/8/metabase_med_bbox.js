const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()

let tre = io.lesDatafil("full_med_graf")
let bboxFeatures = io.lesDatafil("inn_bbox").tilesets
let mbtiles = io.lesKildedatafil("mbtiles")

function avrund1d(num) {
  return Math.round(num * 1000) / 1000
}

function avrund4d(bbox) {
  const bboxjson = bbox.map(f => avrund1d(f))
  const ll = [bboxjson[0], bboxjson[1]]
  const ur = [bboxjson[2], bboxjson[3]]
  if (ll[0] > ur[0] || ll[1] > ur[1])
    throw new Error("Ugyldig bbox " + JSON.stringify(bboxjson))
  return [ll, ur]
}

function settBbox(kode, bbox) {
  const node = tre[kode]
  node.bbox = avrund4d(bbox)
}

Object.keys(bboxFeatures).forEach(kode => {
  const bbox = bboxFeatures[kode].bounds
  if (tre[kode]) settBbox(kode, bbox)
  else log.warn("bbox for kode '" + kode + "', men koden eksisterer ikke")
})

Object.keys(mbtiles).forEach(kode => {
  const mbtile = mbtiles[kode]
  if (tre[kode])
    tre[kode].zoom = [parseInt(mbtile.minzoom), parseInt(mbtile.maxzoom)]
  else log.warn("bbox for kode '" + kode + "', men koden eksisterer ikke")
})

io.skrivDatafil(__filename, tre)
