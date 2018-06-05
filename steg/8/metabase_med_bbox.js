const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()

let tre = io.lesDatafil("full_med_graf")
let bboxFeatures = io.lesDatafil("inn_bbox")

function avrund1d(num) {
  return Math.round(num * 1000) / 1000
}

function avrund4d(bbox) {
  return bbox.map(f => avrund1d(f))
}

function settBbox(kode, bbox) {
  const node = tre[kode]
  node.bbox = avrund4d(bbox)
  node.bbox.forEach(f => {
    if (!f) throw new Error("Ugyldig bbox " + JSON.stringify(node.bbox))
  })
}

Object.keys(bboxFeatures).forEach(kode => {
  const bbox = bboxFeatures[kode]
  if (tre[kode]) settBbox(kode, bbox)
  else log.warn("bbox for kode '" + kode + "', men koden eksisterer ikke")
})

io.skrivDatafil(__filename, tre)
