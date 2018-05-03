const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()

let tre = io.lesDatafil("full_med_graf")
let bboxFeatures = io.lesDatafil("inn_bbox")

function op1d(a, b, fn) {
  const r = fn(a[0], b)
  return r
}

function avrund1d(num) {
  return Math.round(num * 1000) / 1000
}

function avrund4d(bbox) {
  return bbox.map(f => avrund1d(f))
}

function utvidBbox(kode, bbox) {
  const node = tre[kode]
  if (!node) {
    log.warn("Mangler kode " + kode + " i metabase.")
    return
  }
  const c = node.bbox
  if (node.bbox)
    bbox = [
      Math.min(bbox[0], c[0]),
      Math.min(bbox[1], c[1]),
      Math.min(bbox[2], c[2]),
      Math.min(bbox[3], c[3])
    ]
  node.bbox = avrund4d(bbox)
  node.bbox.forEach(f => {
    if (!f) throw new Error("Ugyldig bbox " + JSON.stringify(node.bbox))
  })
  node.foreldre.forEach(fkode => utvidBbox(fkode, bbox))
}

Object.keys(bboxFeatures).forEach(kode => {
  const bbox = bboxFeatures[kode]
  if (tre[kode]) utvidBbox(kode, bbox)
  else log.warn("bbox for kode '" + kode + "', men koden eksisterer ikke")
})

io.skrivDatafil(__filename, tre)
