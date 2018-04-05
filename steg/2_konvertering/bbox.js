const io = require('../../lib/io')
const config = require('../../config')

let bboxIn = io.readJson(config.datakilde.bbox)

function prefixedKode(kode) {
  kode = kode.toUpperCase()
  if (kode[2] === '_') return kode
  if ('0123456789'.indexOf(kode[0]) >= 0) return 'BS_' + kode
  return 'MI_' + kode
}

let bbox = {}
for (let key of Object.keys(bboxIn)) {
  bbox[prefixedKode(key)] = bboxIn[key]
}

function round(num) {
  return Math.round(num * 1000) / 1000
}

function map(bbox) {
  return [[round(bbox[2]), round(bbox[3])], [round(bbox[0]), round(bbox[1])]]
}

let r = {}
for (let kode of Object.keys(bbox)) {
  if (bbox[kode]) {
    let node = {}
    node.bbox = map(bbox[kode])
    r[kode] = node
  }
}

io.writeJson(config.getDataPath(__filename), r)
