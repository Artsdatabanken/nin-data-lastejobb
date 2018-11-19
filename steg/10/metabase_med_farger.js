const config = require("../../config")
const log = require("log-less-fancy")()
const io = require("../../lib/io")
const blandFarger = require("../../lib/fargefunksjon")

let data = io.lesDatafil("metabase_med_bbox")
const farger = io.lesDatafil("farger")

function barn(data) {
  const p2c = {}
  Object.keys(data).forEach(kode => {
    const node = data[kode]
    node.foreldre.forEach(forelder => {
      if (!p2c[forelder]) p2c[forelder] = [kode]
      else p2c[forelder].push(kode)
    })
  })
  return p2c
}

const blends = {}

const p2c = barn(data)
Object.keys(farger).forEach(kode => {
  const farge = farger[kode]
  const node = data[kode]
  if (!node) return log.warn("Har farge for ukjent kode " + kode)
  node.farge = farge
  node.foreldre.forEach(fkode => {
    const forelder = data[fkode]
    if (!forelder.farge) {
      if (!blends[fkode]) blends[fkode] = []
      blends[fkode].push(farge)
    }
  })
})

const ftmp = {}
Object.keys(blends).forEach(kode => {
  const blend = blends[kode]
  const node = data[kode]
  //if (kode == "LA-KLG-RE-KS")
  node.farge = blandFarger(blend)
  ftmp[kode] = node.farge
})

io.skrivDatafil(__filename, data)
//io.skrivDatafil("blends", blends)
//io.skrivDatafil("ftmp", ftmp)
