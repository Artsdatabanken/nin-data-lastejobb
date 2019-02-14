const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let tre = io.lesDatafil("metabase_med_url")
let hierarki = io.lesDatafil("kodehierarki")
const barnAv = hierarki.barn

let ukjentBbox = 0
// Forventer følgende katalogstruktur på tile serveren:
// /kartkategori/?/?/kode
// Dvs. at rotkatalog betraktes som klasse av data, eks. gradient eller trinn
const mapfiles = readMbtiles()
const sourceTypes = [
  { type: "polygon", suffix: "3857.mbtiles" },
  { type: "raster.indexed", suffix: "3857.mbtiles" },
  {
    type: "raster.gradient",
    suffix: "3857.mbtiles"
  },
  { type: "point", suffix: "4326.geojson" },
  { type: "observasjon.rutenett", suffix: "32633.geojson" }
]

sourceTypes.forEach(source => addKartformat(source))
normaliserGradienter()
if (ukjentBbox > 0) log.info("bbox for '" + ukjentBbox + "' koder.")
zoomlevels(typesystem.rotkode)

io.skrivDatafil(__filename, tre)

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

function addKartformat(source) {
  const { type, suffix } = source
  Object.keys(tre).forEach(xkode => {
    const node = tre[xkode]
    const path = `${node.url}/${type}.${suffix}`
    const mapfile = mapfiles[path]
    if (!mapfile) return
    const target = tre[xkode]

    if (!target.kartformat) target.kartformat = {}
    const kartformat = target.kartformat
    if (!kartformat[type]) kartformat[type] = {}
    const cv = kartformat[type]
    cv.url = config.webserver + path
    if (mapfile.maxzoom) {
      cv.zoom = [parseInt(mapfile.minzoom), parseInt(mapfile.maxzoom)]
    }
    if (mapfile.bounds) {
      // For now, no bounds for GeoJSON
      cv.zoom = [parseInt(mapfile.minzoom), parseInt(mapfile.maxzoom)]
      target.bbox = avrund4d(mapfile.bounds)
    }
    if (mapfile.format) cv.format = mapfile.format
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
    if (!intervall.original) {
      log.warn("Mangler opprinnelig intervall for " + kode)
      return
    }
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
  const nmin = Math.trunc((255 * (min - tmin)) / span) + tmin
  const nmax = Math.trunc((255 * (max - tmin)) / span) //- 0.001
  barn.normalisertVerdi = [nmin, nmax]
}

function zoomlevels(kode, bbox, zoom) {
  if (!barnAv[kode]) return
  barnAv[kode].forEach(bkode => {
    const barn = tre[bkode]
    if (barn) {
      barn.bbox = barn.bbox || bbox
      barn.zoom = barn.zoom || zoom
      if (!barn) console.error(kode, bbox, zoom, barnAv[kode])
    }
  })
}
