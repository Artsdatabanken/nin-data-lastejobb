const tinycolor = require("tinycolor2")

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

// Blander en liste med farger til 1 farge, eksempel på input
//
//  [
//    { "farge": "hsl(33, 55%, 100%)", "vekt": 0 },
//    { "farge": "hsl(58, 58%, 55%)", "vekt": 1 }
//  ],

function blandFarger(arrayAvFargeOgVekt) {
  const vec = [0, 0, 0]
  // console.log(arrayAvFargeOgVekt)
  let vekter = []
  let totalVekt = [0, 0, 0]
  arrayAvFargeOgVekt.forEach(component => {
    let vekt = component.vekt || 1
    if (!Array.isArray(vekt)) vekt = [vekt, vekt, vekt]
    for (let i = 0; i < 3; i++) totalVekt[i] += vekt[i]
    vekter.push(vekt)
  })
  vekter.forEach(vekt => {
    for (let i = 0; i < 3; i++) vekt[i] /= totalVekt[i]
  })
  arrayAvFargeOgVekt.forEach((component, index) => {
    const hsl = tinycolor(component.farge).toHsl()
    const xyz = colorToHslVec(hsl)
    const vekt = vekter[index]
    for (let i = 0; i < 3; i++) {
      vec[i] += xyz[i] * vekt[i]
    }
    //  console.log(xyz, vekt)
  })
  const r = HslVecToColor(vec)
  //  console.log(r.toHslString())
  return r.toHslString()
}

module.exports = blandFarger
