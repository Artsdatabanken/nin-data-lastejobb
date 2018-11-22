const log = require("log-less-fancy")()
const config = require("../../config")
const io = require("../../lib/io")
const typesystem = require("@artsdatabanken/typesystem")
const blandFarger = require("../../lib/fargefunksjon")
const tinycolor = require("tinycolor2")

let farger = io.lesDatafil("farger")
let la = io.lesDatafil("la.json")

let r = {}

Object.keys(la).forEach(kode => {
  blandDelta(kode)
})

function blandDelta(kode) {
  const node = la[kode]
  if (!node.relasjon) return
  const stack = []
  for (var relasjon of node.relasjon) {
    const klg = relasjon.kode
    const delta = farger[klg]
    if (!delta) {
      log.warn("Mangler delta for " + klg)
      continue
    }
    if (delta.vekt) {
      if (!Array.isArray(delta.vekt))
        delta.vekt = [delta.vekt, delta.vekt, delta.vekt]
      stack.push({
        farge: delta.farge,
        vekt: [...delta.vekt],
        kode: klg
      })
    }
  }

  normalize(stack)

  let farge = null
  switch (stack.length) {
    case 0:
      farge = "hsl(255, 95%,50%)"
      break
    case 1:
      farge = stack[0].farge
      break
    default:
      farge = blandFarger(stack)
      break
  }
  //  if (tinycolor(farge).getBrightness() < 20) console.log(stack)
  //  if (tinycolor(farge).getBrightness() > 220) console.log(stack)
  r[kode] = { farge: farge }
}

function normalize(stack) {
  let total = [0, 0, 0]
  stack.forEach(delta => {
    total[0] += delta.vekt[0]
    total[1] += delta.vekt[1]
    total[2] += delta.vekt[2]
    //    if (delta.kode === "LA-KLG-KA-1") console.log(stack)
  })
  stack.forEach(delta => {
    delta.vekt[0] /= total[0]
    delta.vekt[1] /= total[1]
    delta.vekt[2] /= total[2]
  })
}

function harVekt(arr) {
  return arr.find(e => e > 0)
}

function finnBasisfarge(kode) {
  while (true) {
    if (farger[kode]) return farger[kode]
    kode = typesystem.forelder(kode)
  }
}

Object.keys(farger).forEach(kode => (r[kode] = farger[kode]))

io.skrivDatafil(__filename, r)
