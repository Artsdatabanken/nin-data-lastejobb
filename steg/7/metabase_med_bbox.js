const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()

let tre = io.lesDatafil("flett_metabase")
let bboxFeatures = io.lesDatafil("inn_bbox").features

function op2d(a, b, fn) {
  const r = [fn(a[0], b[0]), fn(a[1], b[1])]
  return r
}

function mapPolygon2Bbox(coords) {
  let bbox = [[1e9, 1e9], [-1e9, -1e9]]
  coords.forEach(c => {
    bbox[0] = op2d(bbox[0], c, Math.min)
    bbox[1] = op2d(bbox[1], c, Math.max)
  })
  return bbox
}

function avrund1d(num) {
  return Math.round(num * 1000) / 1000
}

function avrund2d(arr) {
  return [avrund1d(arr[0]), avrund1d(arr[1])]
}

function avrund4d(bbox) {
  return [avrund2d(bbox[0]), avrund2d(bbox[1])]
}

function utvidBbox(kode, bbox) {
  const node = tre[kode]
  const c = node.bbox
  if (node.bbox)
    bbox = [op2d(bbox[0], c[0], Math.min), op2d(bbox[1], c[1], Math.max)]
  node.bbox = avrund4d(bbox)
  node.foreldre.forEach(fkode => utvidBbox(fkode, bbox))
}

bboxFeatures.forEach(feature => {
  let kode = feature.properties.kode
  const bbox = mapPolygon2Bbox(feature.geometry.coordinates[0])
  if (tre[kode]) utvidBbox(kode, bbox)
  else log.warn("Mangler kode " + kode)
})

io.skrivDatafil(__filename, tre)
