const tinycolor = require("tinycolor2")
const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let full = io.lesDatafil("full")
let hierarki = io.lesDatafil("kodehierarki")
const barnAv = hierarki.barn
Object.keys(full).forEach(kode => lagGrafkoblinger(kode, full[kode]))
Object.keys(full).forEach(kode => lagGrafGradientkoblinger(kode, full[kode]))

io.skrivDatafil(__filename, full)

function tilBarn(node) {
  return {
    tittel: node.tittel
  }
}

function lagGrafkobling(kodeFra, kodeTil, kant, metadata, erSubset) {
  if (!kant)
    throw new Error(
      "Mangler navn på kant i relasjon fra " + kodeFra + " til " + kodeTil
    )
  const nodeFra = full[kodeFra]
  const nodeTil = full[kodeTil]
  if (!nodeFra || !nodeTil) {
    log.warn("Mangler kode relasjon " + kodeTil + " <-> " + kodeFra)
    return
  }
  if (kodeFra === kodeTil) {
    throw new Error("Relasjon til seg selv fra " + kodeTil)
  }

  if (!nodeFra.graf) nodeFra.graf = {}
  if (!nodeFra.graf[kant]) nodeFra.graf[kant] = {}
  let kobling = Object.assign({}, metadata, tilBarn(nodeTil))
  kobling.erSubset = erSubset
  delete kobling.kode
  delete kobling.kant
  delete kobling.kantRetur
  nodeFra.graf[kant][kodeTil] = kobling
}

function lagGrafkoblinger(kode, node) {
  if (!node.relasjon) return
  node.relasjon.forEach(e => {
    if (!e.kode) throw new Error("Mangler kode " + e.kode)
    lagGrafkobling(kode, e.kode, e.kant, e, e.erSubset)
    if (e.kantRetur) lagGrafkobling(e.kode, kode, e.kantRetur, e, false)
  })
  delete node.relasjon
}

function supplerMedFarger(farge0, farge, barn) {
  const f1 = new tinycolor(farge0)
  const f = new tinycolor(farge)
  for (let i = 0; i < barn.length; i++) {
    const barnet = barn[i]
    const node = full[barnet.kode]
    const color = tinycolor.mix(f1, f, (100 * i) / (barn.length - 1))
    node.farge = node.farge || color.toHexString()
    barnet.farge = barnet.farge || color.toHexString()
  }
}

function lagGrafGradientkobling(kode, node, type, kantnode) {
  const grkode0 = Object.keys(kantnode)[0]
  const gradForelder = full[grkode0].foreldre[0]
  const src = full[gradForelder]
  if (src.type !== "gradient") return false
  let g = []
  barnAv[gradForelder].forEach(bkode => {
    const b = full[bkode]
    g.push({
      kode: bkode,
      tittel: b.tittel,
      farge: b.farge,
      på: !!kantnode[bkode]
    })
  })
  if (node.gradient === undefined) node.gradient = {}
  if (node.gradient[type] === undefined) node.gradient[type] = []
  g = g.sort((a, b) => (a.kode > b.kode ? 1 : -1))
  supplerMedFarger(src.farge0, src.farge, g)
  node.gradient[type] = {
    kode: gradForelder,
    url: node.url,
    tittel: src.tittel,
    trinn: g
  }
  return true
}

function lagGrafGradientkoblinger(kode, node) {
  if (!node.graf) return
  Object.keys(node.graf).forEach(kant => {
    const kantnode = node.graf[kant]
    if (lagGrafGradientkobling(kode, node, kant, kantnode))
      delete node.graf[kant]
  })
  propagerGradientTilForfedre(node)
}

function propagerGradientTilForfedre(node) {
  node.foreldre.forEach(formor => {
    if (formor.split("-").length > 1) propagerGradientTilFormor(formor, node)
  })
}

function propagerGradientTilFormor(formorkode, node) {
  const formor = full[formorkode]
  const src = node.gradient
  if (!src) return
  if (!formor.gradient) formor.gradient = {}
  const dst = formor.gradient
  Object.keys(src).forEach(type => {
    const srcg = src[type]
    if (!dst[type]) dst[type] = Object.assign({}, srcg)
    else {
      const srct = srcg.trinn
      const dstt = dst[type].trinn
      for (let i = 0; i < dstt.length; i++)
        dstt[i].på = dstt[i].på || srct[i].på
    }
  })
  propagerGradientTilForfedre(formor)
}
