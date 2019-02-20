const tinycolor = require("tinycolor2")
const config = require("../../config")
const log = require("log-less-fancy")()
const io = require("../../lib/io")
const blandFarger = require("../../lib/fargefunksjon")

/*
Mix colors of child nodes to create colors for ancestor nodes missing colors
*/

let data = io.lesDatafil("full")
let farger = io.lesBuildfil("farger")
const la_farger = io.lesDatafil("la_farger")
farger = Object.assign(farger, la_farger)
let hierarki = io.lesDatafil("kodehierarki")
const barnAv = hierarki.barn

const p2c = barn(data)

Object.keys(data).forEach(kode => {
  const node = data[kode]
  if (node.type === "gradient" && node.farge0) {
    if (kode === "NN-LA-KLG-VE") debugger
    gradientrampe(node.farge0, node.farge, barnAv[kode])
  }
})

while (trickleColorsUp()) {}

// Fallback
Object.keys(data).forEach(kode => {
  const node = data[kode]
  //  if (!node.farge) node.farge = "#afecaf"
})

io.skrivDatafil(__filename, data)

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

function trickleColorsUp() {
  const blends = {}
  Object.keys(farger).forEach(kode => {
    const farge_og_vekt = farger[kode]
    const node = data[kode]
    if (!node) return log.warn("Har farge for ukjent kode " + kode)
    if (!node.farge) {
      node.farge = farge_og_vekt.farge
    }
    node.foreldre.forEach(fkode => {
      const forelder = data[fkode]
      if (!farger[fkode]) {
        if (!blends[fkode]) blends[fkode] = []
        blends[fkode].push({ kode: kode, ...farge_og_vekt })
      }
    })
  })

  Object.keys(blends).forEach(kode => {
    const blend = blends[kode]
    const node = data[kode]
    farger[kode] = { farge: blandFarger(blend) }
  })
  return Object.keys(blends).length > 0
}

function gradientrampe(farge0, farge, banaskoder) {
  const f1 = new tinycolor(farge0)
  const f = new tinycolor(farge)
  for (let i = 0; i < banaskoder.length; i++) {
    const bankode = banaskoder[i]
    const node = data[bankode]
    const color = tinycolor.mix(f1, f, (100 * i) / (banaskoder.length - 1))
    node.farge = node.farge || color.toHexString()
    bankode.farge = bankode.farge || color.toHexString()
  }
}
