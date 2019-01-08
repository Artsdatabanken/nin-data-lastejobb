const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()

let tre = io.lesDatafil("full_med_bilder")

function readMbtiles() {
  let mbtiles = io.lesDatafil("inn_mbtiles")
  const r = {}
  Object.keys(mbtiles).forEach(path => (r[path] = mbtiles[path]))
  return r
}

function avrund1d(num) {
  return Math.round(parseFloat(num) * 1000) / 1000
}

function avrund4d(bounds) {
  const bbox = bounds.split(",")
  const bboxjson = bbox.map(f => avrund1d(f))
  const ll = [bboxjson[1], bboxjson[0]]
  const ur = [bboxjson[3], bboxjson[2]]
  if (ll[0] > ur[0] || ll[1] > ur[1])
    throw new Error("Ugyldig bbox " + JSON.stringify(bboxjson))
  return [ll, ur]
}

let ukjentBbox = 0
// Forventer følgende katalogstruktur på tile serveren:
// /kartkategori/?/?/kode
// Dvs. at rotkatalog betraktes som klasse av data, eks. gradient eller trinn
const mbtiles = readMbtiles()

const sourceTypes = ["vector", "raster.indexed", "raster.gradient"]
sourceTypes.forEach(source => addKartformat(source))

function addKartformat(klasse) {
  Object.keys(tre).forEach(xkode => {
    const path = `${xkode.replace(/-/g, "/")}/${klasse}.3857.mbtiles`
    const mbtile = mbtiles[path]
    if (!mbtile) return

    const target = tre[xkode]

    if (!target.kartformat) target.kartformat = {}
    const kartformat = target.kartformat
    if (!kartformat[klasse]) kartformat[klasse] = {}
    const cv = kartformat[klasse]
    if (mbtile.maxzoom) {
      cv.zoom = [parseInt(mbtile.minzoom), parseInt(mbtile.maxzoom)]
    }
    if (mbtile.bounds) {
      // For now, no bounds for GeoJSON
      cv.zoom = [parseInt(mbtile.minzoom), parseInt(mbtile.maxzoom)]
      target.bbox = avrund4d(mbtile.bounds)
    }
    if (mbtile.format) cv.format = mbtile.format
  })
}

if (ukjentBbox > 0) log.info("bbox for '" + ukjentBbox + "' koder.")

io.skrivDatafil(__filename, tre)
