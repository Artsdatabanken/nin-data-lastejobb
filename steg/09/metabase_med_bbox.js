const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()

let tre = io.lesDatafil("full_med_bilder")
let hierarki = io.lesDatafil("kodehierarki")

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
normaliserGradienter()

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

// Regn ut fargeverdier for trinn i kartformat raster.gradient.mbtiles
function normaliserGradienter() {
  Object.keys(tre).forEach(kode => {
    const target = tre[kode]
    const kartformat = target.kartformat
    if (!kartformat) return
    const rgrad = kartformat["raster.gradient"]
    if (!rgrad) return
    const intervall = rgrad.intervall
    if (!intervall) return
    if (!intervall.original) return // Kan bare normalisere hvis vi har opprinnelig intervall
    const barna = hierarki.barn[kode]
    barna.forEach(bkode => {
      const barn = tre[bkode]
      normaliserGradientTrinn(bkode, barn, rgrad)
    })
  })
}

function normaliserGradientTrinn(bkode, barn, rgrad) {
  if (barn.normalisertVerdi) {
    const bv = barn.normalisertVerdi
    if (!Array.isArray(bv)) barn.normalisertVerdi = [bv, bv + 1]
    console.log(barn)
    return
  }
  const intervall = barn.intervall
  if (!intervall) return log.warn("Mangler intervall for " + bkode)
  if (Array.isArray(intervall)) return
  let { min, max } = intervall
  const [tmin, tmax] = rgrad.intervall.original
  min = Math.max(min, tmin)
  max = Math.min(max, tmax)
  intervall.min = min
  intervall.max = max
  const span = tmax - tmin
  const nmin = Math.trunc((255 * (min - tmin)) / span)
  const nmax = Math.trunc((255 * (max - tmin)) / span)
  barn.normalisertVerdi = [nmin, nmax]
  log.debug("normalisert", bkode, "=>", barn.normalisertVerdi)
}

if (ukjentBbox > 0) log.info("bbox for '" + ukjentBbox + "' koder.")

io.skrivDatafil(__filename, tre)
