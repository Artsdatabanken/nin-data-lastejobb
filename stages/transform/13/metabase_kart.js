const { io } = require("lastejobb")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")
const path = require("path")

let tre = io.lesDatafil("metabase_tweaks")
let hierarki = io.lesDatafil("kodehierarki")
let filindeks = io.lesDatafil("filindeks")
const barnAv = hierarki.barn

let ukjentBbox = 0

addKartformat()
normaliserGradienter()
if (ukjentBbox > 0) log.info("bbox for '" + ukjentBbox + "' koder.")
propagerNedKart()
zoomlevels(typesystem.rotkode)
settDefaultVisning()
io.skrivDatafil(__filename, tre)

function avrund1d(num) {
  return Math.round(parseFloat(num) * 1000) / 1000
}

function avrund4d(bbox) {
  const bboxjson = bbox.map(f => avrund1d(f))
  const ll = [bboxjson[1], bboxjson[0]]
  const ur = [bboxjson[3], bboxjson[2]]
  if (ll[0] > ur[0] || ll[1] > ur[1])
    log.warn("Ugyldig bbox " + JSON.stringify(bboxjson))
  return [ll, ur]
}

function bboxFraSpatialite(fileinfo) {
  const { extent_min_x, extent_min_y, extent_max_x, extent_max_y } = fileinfo
  const bbox = [extent_min_x, extent_min_y, extent_max_x, extent_max_y]
  return avrund4d(bbox)
}

function bboxFraMbtilesMetadata(bounds) {
  const bbox = bounds.split(",")
  return avrund4d(bbox)
}

function minimizeBbox(bbox1, bbox2) {
  if (!bbox1) return bbox2
  if (!bbox2) return bbox1
  return [
    [Math.max(bbox1[0][0], bbox2[0][0]), Math.max(bbox1[0][1], bbox2[0][1])],
    [Math.min(bbox1[1][0], bbox2[1][0]), Math.min(bbox1[1][1], bbox2[1][1])]
  ]
}

function settDefaultVisning() {
  const prio = ["raster_gradient", "raster_indexed", "polygon"]
  Object.keys(tre).forEach(kode => {
    const kart = tre[kode].kart
    if (!kart) return
    if (!kart.format) return
    for (let pri of prio)
      if (kart.format[pri]) {
        kart.aktivtFormat = pri
        return
      }
  })
}

function addKartformat() {
  Object.keys(tre).forEach(xkode => {
    const node = tre[xkode]
    const target = tre[xkode]
    if (!target.kart) target.kart = {}
    const maps = filindeks[node.url.substring(1)]
    if (!maps) return
    Object.keys(maps).forEach(filename => {
      const fileinfo = maps[filename]
      const ext = path.extname(filename)
      if (ext === ".sqlite") {
        const bb = bboxFraSpatialite(fileinfo)
        target.bbox = minimizeBbox(target.bbox, bb)
      }
      if (!filename) return // Is a directory
      if (".mbtiles.geojson".indexOf(path.extname(filename)) < 0) return
      if (filename.indexOf("3857") < 0) return
      if (!target.kart.format) target.kart.format = {}
      const format = target.kart.format
      const type = filename.split(".").shift()
      if (!format[type]) format[type] = {}
      const cv = format[type]

      if (sladd(node.url)) cv.publish = -2 // Kun internt

      const webserver = "https://data.artsdatabanken.no"
      cv.url = webserver + node.url + "/" + filename
      if (fileinfo.maxzoom) {
        cv.zoom = [parseInt(fileinfo.minzoom), parseInt(fileinfo.maxzoom)]
      }
      cv.filnavn = filename
      cv.størrelse = fileinfo.size
      cv.oppdatert = fileinfo.mtime
      if (fileinfo.bounds) {
        // For now, no bounds for GeoJSON
        cv.zoom = [parseInt(fileinfo.minzoom), parseInt(fileinfo.maxzoom)]
        const bb = bboxFraMbtilesMetadata(fileinfo.bounds)
        target.bbox = minimizeBbox(target.bbox, bb)
      }
      if (fileinfo.format) cv.format = fileinfo.format
    })
  })
}

// Regn ut fargeverdier for trinn i kartformat raster_gradient.mbtiles
function normaliserGradienter() {
  Object.keys(tre).forEach(kode => {
    const target = tre[kode]
    if (!target.kart) return
    if (!target.kart.format) return
    const format = target.kart.format
    const rgrad = format["raster_gradient"]
    if (!rgrad) return
    const intervall = rgrad.intervall
    if (!intervall) return
    if (!intervall.original) {
      log.warn("Mangler opprinnelig intervall for " + kode)
      return
    }
    const barna = hierarki.barn[kode]
    if (!barna) return
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
  const [nmin, nmax] = rgrad.intervall.normalisertVerdi
  const nrange = nmax - nmin
  const x1 = Math.trunc((nrange * (min - tmin)) / span) + nmin
  let x2 = Math.trunc((nrange * (max - tmin)) / span) + nmin
  if (max == 0) x2 = nmax // Unbounded
  barn.normalisertVerdi = [x1, x2]
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

function sladd(url) {
  if (!url) return false
  if (url.indexOf("Elv") >= 0) return false
  if (url.indexOf("Limniske") >= 0) return false
  if (url.indexOf("Terreng") >= 0) return false
  if (url.indexOf("Regional_naturvariasjon") >= 0) return false
  if (url.indexOf("Erosjon") >= 0) return false
  if (url.indexOf("Finmat") >= 0) return false
  if (url.indexOf("Sediment") >= 0) return false
  if (url.indexOf("Ultrama") >= 0) return false
  if (url.indexOf("Kalk") >= 0) return false
  if (url.indexOf("Fossil") >= 0) return false
  if (url.indexOf("Bergart") >= 0) return false
  if (url.indexOf("Natur_i_Norge/Natursystem") >= 0) return true
  return false
}

function propagerNedKart() {
  for (let kode of Object.keys(tre)) {
    const node = tre[kode]
    if (node.overordnet.length === 0) propagerNedKartFra(kode)
  }
}

function propagerNedKartFra(kode, kartformat) {
  const node = tre[kode]
  const barn = hierarki.barn[kode]
  if (kartformat) {
    if (kartformat.raster_gradient) {
      brukKartFraForelder(node, kartformat, "raster_gradient")
      node.kart.format.raster_gradient.visning = ["diskret"]
    }
    if (kartformat.raster_indexed)
      brukKartFraForelder(node, kartformat, "raster_indexed")
  }
  barn &&
    barn.forEach(bkode => {
      kartformat = Object.assign({}, kartformat, node.kart.format)
      propagerNedKartFra(bkode, kartformat)
    })
}

function brukKartFraForelder(node, kartformat) {
  if (!node.kart) node.kart = {}
  if (!node.kart.format) node.kart.format = {}
  node.kart.format = Object.assign({}, node.kart.format, kartformat)
}
