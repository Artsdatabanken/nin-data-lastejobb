const tinycolor = require("tinycolor2")
const config = require("../../config")
const io = require("../../lib/io")
const typesystem = require("@artsdatabanken/typesystem")

let farger = io.lesDatafil("farger")
let la = io.lesDatafil("la.json")

let r = {}

Object.keys(la).forEach(kode => {
  blandDelta(kode)
})

//blandDelta("LA-K-F-1")

function blandDelta(kode) {
  const node = la[kode]
  if (!node.relasjon) return
  let total = [1.0, 1.0, 1.0]
  for (var relasjon of node.relasjon) {
    const klg = relasjon.kode
    const delta = farger[klg]
    if (!delta) {
      console.warn("Mangler delta for " + klg)
      return
    }
    if (delta.vekt) {
      if (!Array.isArray(delta.vekt))
        delta.vekt = [delta.vekt, delta.vekt, delta.vekt]
      total[0] += delta.vekt[0]
      total[1] += delta.vekt[1]
      total[2] += delta.vekt[2]
    } else delta.vekt = [0, 0, 0]
  }
  const stack = []
  node.relasjon.forEach(relasjon => {
    const klg = relasjon.kode
    const delta = farger[klg]
    stack.push({
      farge: delta.farge,
      vekt: frac3d(delta.vekt, total),
      kode: klg
    })
  })

  stack.push({
    farge: finnBasisfarge(kode),
    vekt: frac3d([1, 1, 1], total),
    kode: kode
  })
  const farge = mixer(stack)
  r[kode] = farge.toHslString()
}

function frac3d(part, total) {
  return [
    fraction(part[0], total[0]),
    fraction(part[1], total[1]),
    fraction(part[2], total[2])
  ]
}
function fraction(part, total) {
  if (!total) return 0
  return part / total
}

function finnBasisfarge(kode) {
  while (true) {
    if (farger[kode]) return farger[kode]
    kode = typesystem.forelder(kode)
  }
}

function colorToHslVec(color) {
  const tc = tinycolor(color)
  const hsl = tc.toHsl()
  const h = hsl.h < 180 ? hsl.h : hsl.h - 360
  const x = Math.cos((hsl.h / 180) * Math.PI) * hsl.s
  const y = Math.sin((hsl.h / 180) * Math.PI) * hsl.s
  const z = hsl.l
  return [x, y, z]
}

function HslVecToColor(vec) {
  const [x, y, z] = vec
  const h = (Math.atan2(y, x) * 180) / Math.PI
  const s = Math.sqrt(x * x + y * y)
  const l = z
  return tinycolor({ h: h > 0 ? h : h + 360, s: s, l: l })
}

function mixer(stack) {
  const vec = [0, 0, 0]
  stack.forEach(component => {
    const hsl = tinycolor(component.farge).toHsl()
    const xyz = colorToHslVec(hsl)
    for (let i = 0; i < 3; i++) vec[i] += xyz[i] * component.vekt[i]
  })
  const r = HslVecToColor(vec)
  return r
}

r = Object.assign(r, farger)
io.skrivDatafil(__filename, r)
