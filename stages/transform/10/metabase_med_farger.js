const tinycolor = require("tinycolor2")
const log = require("log-less-fancy")()
const { io } = require("lastejobb")
const { blend } = require("@artsdatabanken/color-blend")
const typesystem = require("@artsdatabanken/typesystem")

/*
Mix colors of child nodes to create colors for ancestor nodes missing colors
*/

let tre = io.lesDatafil("full_med_graf")
let hierarki = io.lesDatafil("kodehierarki")
const foreldre = hierarki.foreldre
const barnAv = hierarki.barn

Object.keys(tre).forEach(kode => {
  const node = tre[kode]
  if (node.type !== "gradient") return
  const barnkoder = typesystem.sorterKoder(barnAv[kode])
  gradientrampe(node.farge0, node.farge, barnkoder)
})

while (trickleColorsUp()) {}
settFargePåGradienter()
settFargePåFlagg()

Object.keys(tre).forEach(kode => {
  const node = tre[kode]
  if (!node.farge) node.farge = blandBarnasFarger(kode)
})

Object.keys(tre).forEach(kode => {
  const node = tre[kode]
  if (!node.farge) node.farge = brukOverordnetsFarge(kode)
})

function brukOverordnetsFarge(kode) {
  while (foreldre[kode].length > 0) {
    kode = foreldre[kode][0]
    const node = tre[kode]
    if (node.farge) return node.farge
  }
}

io.skrivDatafil(__filename, tre)

function blandBarnasFarger(kode) {
  if (kode.startsWith("AR-")) return tre["AR"].farge

  const node = tre[kode]
  if (node.farge) return node.farge
  const farger = []
  const barna = barnAv[kode]
  if (barna)
    barna.forEach(bk => {
      const farge = tre[bk].farge ? tre[bk].farge : blandBarnasFarger(bk)
      if (farge) farger.push({ farge: farge })
    })
  if (farger.length === 0 && node.gradient) {
    Object.keys(node.gradient).forEach(relasjon => {
      const gruppe = node.gradient[relasjon]
      Object.keys(gruppe.barn).forEach(grkode => {
        gruppe.barn[grkode].trinn.forEach(bk => {
          if (bk.farge) farger.push({ farge: bk.farge })
        })
      })
    })
  }
  if (farger.length === 0) return null
  node.farge = blend(farger)
  return node.farge
}

function trickleColorsUp() {
  wasChanged = false
  const blends = {}
  Object.keys(tre).forEach(kode => {
    const node = tre[kode]
    if (!node) return log.warn("Har farge for ukjent kode " + kode)
    if (!node.farge) return
    node.foreldre.forEach(fkode => {
      if (!blends[fkode]) blends[fkode] = []
      blends[fkode].push({ kode: kode, farge: node.farge })
    })
  })

  Object.keys(blends).forEach(kode => {
    const node = tre[kode]
    if (node.farge) return
    const farger2 = blends[kode]
    node.farge = blend(farger2)
    wasChanged = true
  })
  return wasChanged
}

function gradientrampe(farge0, farge, barnkoder) {
  const f1 = new tinycolor(farge0)
  const f = new tinycolor(farge)
  for (let i = 0; i < barnkoder.length; i++) {
    const barnkode = barnkoder[i]
    const node = tre[barnkode]
    if (!node.farge) {
      if (!f1 || !f)
        throw new Error(
          "Mangler farge eller farge0 for forelder av " + barnkode
        )
      const color = tinycolor.mix(f1, f, (100 * i) / (barnkoder.length - 1))
      node.farge = node.farge || color.toHexString()
    }
  }
}

function settFargePåGradienter() {
  Object.keys(tre).forEach(kode => {
    const node = tre[kode]
    if (!node.gradient) return
    Object.keys(node.gradient).forEach(type => {
      const gruppe = node.gradient[type]
      Object.keys(gruppe.barn).forEach(type => {
        const grad = gruppe.barn[type]
        grad.trinn.forEach(
          trinn => (trinn.farge = trinn.farge || tre[trinn.kode].farge)
        )
      })
    })
  })
}

function settFargePåFlagg() {
  Object.keys(tre).forEach(skode => {
    const node = tre[skode]
    if (!node.flagg) return
    Object.keys(node.flagg).forEach(kode => {
      node.flagg[kode].farge = tre[kode].farge
    })
  })
}
