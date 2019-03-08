const tinycolor = require("tinycolor2")
const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let full = io.lesDatafil("full")
let hierarki = io.lesDatafil("kodehierarki")
const barnAv = hierarki.barn
Object.keys(full).forEach(kode => lagGrafkoblinger(kode, full[kode]))
Object.keys(full).forEach(kode => lagGradientPåSegSelv(kode, full[kode]))
Object.keys(full).forEach(kode => lagGrafGradientkoblinger(kode, full[kode]))
Object.keys(full).forEach(kode => propagerGradientTilRelasjon(kode, full[kode]))

io.skrivDatafil(__filename, full)

function tilBarn(node) {
  return {
    tittel: node.tittel
  }
}

function lagGradientPåSegSelv(kode, node) {
  if (!node.foreldre) return
  const grkode = node.foreldre[0]
  if (!grkode) return
  const forelder = full[grkode]
  if (forelder.type !== "gradient") return
  const kantnode = { [kode]: true }
  lagGrafGradientkobling2(kode, node, forelder.tittel.nb, kantnode)
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
  kobling.type = nodeTil.type
  if (nodeTil.type === "flagg" && kobling.kant !== "Datasett") {
    if (!nodeFra.flagg) nodeFra.flagg = {}
    nodeFra.flagg[kodeTil] = {
      tittel: nodeTil.tittel
    }
  } else {
    kobling.erSubset = erSubset
    delete kobling.kode
    delete kobling.kant
    delete kobling.kantRetur
    delete kobling.kantReturFraAlleBarna
    nodeFra.graf[kant][kodeTil] = kobling
  }
}
function lagGrafkoblingerTilAlleBarna(
  kodeFra,
  kodeTil,
  kant,
  metadata,
  erSubset
) {
  const barna = barnAv[kodeFra] || []
  lagGrafkobling(kodeFra, kodeTil, kant, metadata, erSubset)
  barna.forEach(kodeFraBarn => {
    lagGrafkoblingerTilAlleBarna(kodeFraBarn, kodeTil, kant, metadata, erSubset)
  })
}

function lagGrafkoblinger(kode, node) {
  if (!node.relasjon) return
  node.relasjon.forEach(e => {
    if (!e.kode) throw new Error("Mangler kode " + e.kode)
    lagGrafkobling(kode, e.kode, e.kant, e, e.erSubset)

    if (e.kantRetur) {
      if (e.kantReturFraAlleBarna) {
        lagGrafkoblingerTilAlleBarna(e.kode, kode, e.kantRetur, e, e.erSubset)
      } else lagGrafkobling(e.kode, kode, e.kantRetur, e, false)
    }
  })
  delete node.relasjon
}

function lagGrafGradientkoblinger(kode, node) {
  if (!node.graf) return
  Object.keys(node.graf).forEach(kant => {
    const kantnode = node.graf[kant]
    lagGrafGradientkobling(kode, node, kant, kantnode)
  })
  propagerGradientTilForfedre(node)
}

function lagGrafGradientkobling(kode, node, type, kantnode) {
  const gradienter = {}
  Object.keys(kantnode).forEach(grkode0 => {
    const forelderkode = full[grkode0].foreldre[0]
    const forelder = full[forelderkode]
    if (forelder.type === "gradient") gradienter[forelderkode] = grkode0
  })
  Object.keys(gradienter).forEach(grkode => {
    lagGrafGradientkobling2(
      kode,
      node,
      full[grkode].tittel.nb,
      kantnode,
      grkode
    )
  })
}

function lagGrafGradientkobling2(kode, node, type, kantnode) {
  const grkode0 = Object.keys(kantnode)[0]
  const gradForelder = full[grkode0].foreldre[0]
  const src = full[gradForelder]
  if (!skalMed(gradForelder)) return false
  let g = []
  const barna = typesystem.sorterKoder(barnAv[gradForelder])
  barna.forEach(bkode => {
    const b = full[bkode]
    g.push({
      kode: bkode,
      tittel: b.tittel,
      på: !!kantnode[bkode]
    })
    //    if (kode === k) log.warn(kode, bkode, !!kantnode[bkode], kantnode[bkode])
    if (kantnode[bkode]) delete kantnode[bkode]
  })
  if (node.gradient === undefined) node.gradient = {}
  if (node.gradient[type] === undefined) node.gradient[type] = []
  node.gradient[type] = {
    kode: gradForelder,
    url: node.url,
    tittel: src.tittel,
    trinn: g
  }
  return true
}

function skalMed(kode) {
  if (kode.startsWith("NN-NA-LKM")) return true
  if (kode.startsWith("NN-LA-KLG")) return true
  return false
}

function propagerGradientTilForfedre(node) {
  node.foreldre.forEach(formor => {
    if (formor.split("-").length > 1) propagerGradientTilFormor(formor, node)
  })
}

function propagerGradientTilRelasjon(kode, node) {
  const graf = node.graf
  if (!graf) return
  Object.keys(graf).forEach(gk => {
    const rel = graf[gk]
    const vekt = frekvens(gk)
    Object.keys(rel).forEach(kode => {
      if (!kode.startsWith("AR")) return
      propagerGradientTilNode(full[kode], node, vekt)
    })
  })
}

function frekvens(tekst) {
  const tab = {
    vanlig_art: 1,
    konstant_art: 1,
    mengdeart: 1,
    "gradient-tyngdepunktart": 2,
    tyngdepunktart: 1,
    absolutt_skilleart: 1,
    "sterk_relativ skilleart": 1,
    "svak_relativ skilleart": 1,
    skilleart: 1,
    kjennetegnende_tyngdepunktart: 1,
    dominerende_mengdeart: 1
  }
  if (!tab.hasOwnProperty(tekst) && tekst.indexOf("art") >= 0)
    throw new Error("Ukjent forekomst: " + tekst)
  return tab[tekst]
}

function propagerGradientTilNode(tilNode, fraNode, vekt) {
  const src = fraNode.gradient
  if (!src) return
  if (!tilNode.gradient) tilNode.gradient = {}

  const dst = tilNode.gradient
  Object.keys(src).forEach(type => {
    const srcg = src[type]
    if (!dst[type]) dst[type] = JSON.parse(JSON.stringify(srcg))
    else {
      const srct = srcg.trinn
      const dstt = dst[type].trinn
      for (let i = 0; i < dstt.length; i++) {
        if (srct[i].på) {
          dstt[i].på = true
          dstt[i].vekt = Math.max(dstt[i].vekt || 0, vekt)
        }
      }
    }
  })
}

function propagerGradientTilFormor(formorkode, node) {
  const formor = full[formorkode]
  propagerGradientTilNode(formor, node)
  propagerGradientTilForfedre(formor)
}
