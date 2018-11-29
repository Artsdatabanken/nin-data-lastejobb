const config = require("../../config")
const log = require("log-less-fancy")()
const io = require("../../lib/io")
const blandFarger = require("../../lib/fargefunksjon")

let kodehierarki = io.lesDatafil("kodehierarki")
let farger = io.lesDatafil("farger")
const la_farger = io.lesDatafil("la_farger")
farger = Object.assign(farger, la_farger)

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
  const farge_og_vekt = farger[kode]
  const node = data[kode]
  if (!node) return log.warn("Har farge for ukjent kode " + kode)
  node.farge = farge_og_vekt.farge
  node.foreldre.forEach(fkode => {
    const forelder = data[fkode]
    if (!forelder.farge) {
      if (!blends[fkode]) blends[fkode] = []
      blends[fkode].push(farge_og_vekt)
    }
  })
})

Object.keys(blends).forEach(kode => {
  const blend = blends[kode]
  const node = data[kode]
  node.farge = blandFarger(blend)
})

// Fallback
Object.keys(data).forEach(kode => {
  const node = data[kode]
  if (!node.farge) node.farge = "#afecaf"
})

io.skrivDatafil(__filename, data)
