const { io, log } = require("@artsdatabanken/lastejobb")
const sorterKoder = require("../sorter")

let tre = io.lesTempJson("full")
let hierarki = io.lesTempJson("kodehierarki")
const barnAv = hierarki.barn
const skalPropageresNed = {}

Object.keys(tre).forEach(kode => lagGrafkoblinger(kode, tre[kode]))
Object.keys(tre).forEach(kode => lagGradientPåSegSelv(kode, tre[kode]))
Object.keys(tre).forEach(kode => lagGrafGradientkoblinger(kode, tre[kode]))
Object.keys(tre).forEach(kode => propagerGradientTilRelasjon(tre[kode]))
Object.keys(tre).forEach(kode => propagerNedPresisjon(kode, tre[kode]))
Object.keys(tre).forEach(kode => propagerNedMålestokk(kode, tre[kode]))

propagerGrafkoblinger()

io.skrivDatafil(__filename, tre)

function tilBarn(node) {
  return {
    tittel: node.tittel
  }
}

function lagGradientPåSegSelv(kode, node) {
  if (!node.foreldre) return
  const grkode = node.foreldre[0]
  if (!grkode) return
  const forelder = tre[grkode]
  if (forelder.type !== "gradient") return
  const kantnode = { [kode]: true }
  lagGrafGradientkobling2(kode, node, forelder.tittel.nb, kantnode)
}

function lagGrafkobling(kodeFra, kodeTil, kant, metadata, erSubset) {
  //  if (kodeFra === "OR-KV" || kodeTil === "OR-KV") debugger
  if (!kant)
    throw new Error(
      "Mangler navn på kant i relasjon fra " + kodeFra + " til " + kodeTil
    )
  const nodeFra = tre[kodeFra]
  const nodeTil = tre[kodeTil]
  if (!nodeFra || !nodeTil) {
    log.warn("Mangler kode relasjon " + kodeTil + " <-> " + kodeFra)
    debugger
    return
  }
  if (nodeFra.skjul) return
  if (nodeTil.skjul) return
  if (kodeFra === kodeTil) {
    return log.warn("Relasjon til seg selv fra " + kodeTil)
  }

  if (!nodeFra.graf) nodeFra.graf = {}
  let kobling = Object.assign({}, metadata, tilBarn(nodeTil))
  kobling.type = nodeTil.type
  if (!nodeFra.graf[kant]) nodeFra.graf[kant] = {}
  if (nodeTil.type === "flagg" && kobling.kant !== "Datasett") {
    if (!nodeFra.flagg) nodeFra.flagg = {}
    nodeFra.flagg[kodeTil] = {
      tittel: nodeTil.tittel
    }
    return true
  }

  kobling.erSubset = erSubset
  delete kobling.kode
  delete kobling.kant
  delete kobling.kantRetur
  delete kobling.kantReturFraAlleBarna
  nodeFra.graf[kant][kodeTil] = kobling
  return true
}

function lagGrafkoblingerTilAlleBarna(
  kodeFra,
  kodeTil,
  kant,
  metadata,
  erSubset
) {
  if (!lagGrafkobling(kodeFra, kodeTil, kant, metadata, erSubset)) return
  const barna = barnAv[kodeFra] || []
  barna.forEach(kodeFraBarn => {
    lagGrafkoblingerTilAlleBarna(kodeFraBarn, kodeTil, kant, metadata, erSubset)
  })
}

function propagerGrafkoblinger() {
  Object.entries(skalPropageresNed).forEach(([kode, relasjoner]) => {
    Object.entries(relasjoner).forEach(([relasjon, kanter]) => {
      const barna = barnAv[kode] || []
      barna.forEach(barnkode => {
        const barnet = tre[barnkode]
        if (barnet.graf && barnet.graf[relasjon]) {
          debugger
          return
        }

        kanter.forEach(e =>
          lagGrafkoblingerTilAlleBarna(
            barnkode,
            e.kode,
            e.kantRetur,
            e,
            e.erSubset
          )
        )
      })
    })
  })
}

function lagGrafkoblinger(kode, node) {
  if (!node.relasjon) return
  if (Array.isArray(node.relasjon))
    // old style
    node.relasjon.forEach(e => {
      konverterRelasjon(kode, e)
    })
  else {
    // new style
    Object.keys(node.relasjon).forEach(key => {
      const koder = node.relasjon[key]
      koder.forEach(destkode => {
        const parts = key.split("<->")
        const [kant, kantRetur] = parts
        konverterRelasjon(kode, { kode: destkode, kant, kantRetur })
      })
    })
  }
  delete node.relasjon
}

function konverterRelasjon(kode, e) {
  if (!e.hasOwnProperty("kode")) throw new Error("Mangler kode " + e.kode)
  lagGrafkobling(kode, e.kode, e.kant, e, e.erSubset)
  if (e.kantRetur) {
    lagGrafkobling(
      e.kode,
      kode,
      e.kantRetur,
      e,
      e.kantReturFraAlleBarna && e.erSubset
    )
    if (e.kantReturFraAlleBarna) {
      if (!skalPropageresNed[e.kode]) skalPropageresNed[e.kode] = {}
      const barn = skalPropageresNed[e.kode]
      barn[e.kant] = [...(barn[e.kant] || []), { ...e, kode }]
    }
  }
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
    if (!erISammeDomene(kode, grkode0)) return
    const forelderkode = tre[grkode0].foreldre[0]
    const forelder = tre[forelderkode]
    if (forelder.type === "gradient") gradienter[forelderkode] = grkode0
  })
  Object.keys(gradienter).forEach(grkode => {
    const forelderkode = tre[grkode].foreldre[0]
    lagGrafGradientkobling2(kode, node, tre[forelderkode], kantnode, grkode)
  })
}

function erISammeDomene(kode1, kode2) {
  return prefix(kode1) === prefix(kode2)
}

function prefix(kode) {
  return kode.replace("NN-", "").split("-")[0]
}

function lagGrafGradientkobling2(kode, node, xxxx, kantnode) {
  const grkode0 = Object.keys(kantnode)[0]
  const kodeGradForelder = tre[grkode0].foreldre[0]
  const kodeGradFarfar = tre[kodeGradForelder].foreldre[0]
  const gradForelder = tre[kodeGradForelder]
  const gradFarfar = tre[kodeGradFarfar]
  if (!skalMed(kodeGradForelder)) return false
  let g = []
  const barna = sorterKoder(barnAv[kodeGradForelder])
  barna.forEach(bkode => {
    const b = tre[bkode]
    g.push({
      kode: bkode,
      tittel: b.tittel,
      på: !!kantnode[bkode]
    })
    //    if (kode === k) log.warn(kode, bkode, !!kantnode[bkode], kantnode[bkode])
    if (kantnode[bkode]) delete kantnode[bkode]
  })
  if (node.gradient === undefined) node.gradient = {}
  if (node.gradient[kodeGradFarfar] === undefined)
    node.gradient[kodeGradFarfar] = {
      tittel: gradFarfar.tittel,
      barn: {}
    }
  node.gradient[kodeGradFarfar].barn[kodeGradForelder] = {
    kode: kodeGradForelder,
    url: node.url,
    tittel: gradForelder.tittel,
    trinn: g
  }
  return true
}

function skalMed(kode) {
  return true
  if (kode.startsWith("NN-NA-LKM")) return true
  if (kode.startsWith("NN-LA-KLG")) return true
  return false
}

function propagerGradientTilForfedre(node) {
  node.foreldre.forEach(formor => {
    if (formor.split("-").length > 1) propagerGradientTilFormor(formor, node)
  })
}

function propagerGradientTilRelasjon(node) {
  const graf = node.graf
  if (!graf) return
  Object.keys(graf).forEach(gk => {
    const rel = graf[gk]
    const vekt = frekvens(gk)
    Object.keys(rel).forEach(kode => {
      if (!kode.startsWith("AR")) return
      propagerGradientTilNode(tre[kode], node, vekt)
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
    dominerende_mengdeart: 1,
    "Har effekt på andre arter i": 1
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
    const srcl = src[type]
    if (!dst[type]) dst[type] = JSON.parse(JSON.stringify(srcl))
    else {
      Object.entries(srcl.barn).forEach(([kode, srcg]) => {
        const srct = srcg.trinn
        if (!dst[type].barn[kode])
          return (dst[type].barn[kode] = JSON.parse(JSON.stringify(srcg)))

        const dstt = dst[type].barn[kode].trinn
        for (let i = 0; i < dstt.length; i++) {
          if (srct[i].på) {
            dstt[i].på = true
            dstt[i].vekt = Math.max(dstt[i].vekt || 0, vekt)
          }
        }
      })
    }
  })
}

function propagerGradientTilFormor(formorkode, node) {
  const formor = tre[formorkode]
  propagerGradientTilNode(formor, node)
  propagerGradientTilForfedre(formor)
}

function propagerNedPresisjon(kode, node) {
  if (!node.kart || !node.kart.presisjon) return
  const barn = barnAv[kode] || []
  barn.forEach(bkode => propagerPresisjonTilBarn(bkode, node.kart.presisjon))
}

function propagerPresisjonTilBarn(kode, presisjon) {
  const barnet = tre[kode]
  barnet.kart = barnet.kart || {}
  if (barnet.kart.presisjon) return
  barnet.kart.presisjon = presisjon
  const barn = barnAv[kode] || []
  barn.forEach(bkode => propagerPresisjonTilBarn(bkode, presisjon))
}

function propagerNedMålestokk(kode, node) {
  if (!node.kart || !node.kart.målestokk) return
  const barn = barnAv[kode] || []
  barn.forEach(bkode => propagerMålestokkTilBarn(bkode, node.kart.målestokk))
}

function propagerMålestokkTilBarn(kode, målestokk) {
  const barnet = tre[kode]
  barnet.kart = barnet.kart || {}
  if (barnet.kart.målestokk) return
  barnet.kart.målestokk = målestokk
  const barn = barnAv[kode] || []
  barn.forEach(bkode => propagerMålestokkTilBarn(bkode, målestokk))
}
