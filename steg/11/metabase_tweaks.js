const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let tre = io.lesDatafil("metabase_med_farger")
let hierarki = io.lesDatafil("kodehierarki")
const barnAv = hierarki.barn
const foreldreTil = hierarki.foreldre

let ukjenteKoder = []
let manglerKode = []

Object.keys(tre).forEach(kode => mapOverordnet(kode))
Object.keys(tre).forEach(kode => mapBarn(kode))

if (false) lagRedirectFraTittel(tre)

fjernEnkeltVerneområder(tre)
settFargePåRelasjoner()

if (ukjenteKoder.length > 0)
  log.warn("Kobling til +" + ukjenteKoder.length + " ukjente koder")
if (Object.keys(manglerKode).length > 0)
  log.warn("Mangler kode " + Object.keys(manglerKode))

io.skrivDatafil(__filename, tre)

function sti(kode) {
  return typesystem
    .splittKode(kode)
    .join("/")
    .toLowerCase()
}

function settFargePåRelasjoner() {
  Object.keys(tre).forEach(kode => {
    const node = tre[kode]
    if (!node.graf) return
    Object.keys(node.graf).forEach(typeRelasjon => {
      Object.keys(node.graf[typeRelasjon]).forEach(kode => {
        if (!tre[kode]) {
          ukjenteKoder.push(kode)
          return
        }
        const sub = node.graf[typeRelasjon][kode]
        sub.farge = tre[kode].farge
        delete sub.erSubset
      })
    })
  })
}

function nøstOppForfedre(forelderkey) {
  let r = []
  while (forelderkey) {
    let forelder = tre[forelderkey]
    if (!forelder) {
      manglerKode[forelderkey] = true
      return
    }
    const overordnet = {
      kode: forelderkey,
      tittel: forelder.tittel,
      nivå: forelder.nivå
    }
    if (forelder.stats) overordnet.areal = forelder.stats.areal
    r.push(overordnet)
    const forfedre = foreldreTil[forelderkey]
    if (!forfedre) break
    if (forfedre.length <= 0) break
    forelderkey = forfedre[0]
  }
  return r
}

function mapOverordnet(key) {
  let node = tre[key]
  if (!node) throw new Error("Finner ikke " + key)
  if (!node.overordnet) {
    if (!node.foreldre) {
      log.warn("mangler forelder: " + key)
    }
    node.overordnet =
      node.foreldre && node.foreldre.length > 0
        ? nøstOppForfedre(node.foreldre[0])
        : []
    delete node.foreldre
  }
}

function mapBarn(key) {
  let node = tre[key]
  let barn = {}
  if (barnAv[key]) {
    barnAv[key].forEach(ckey => {
      if (erRelasjon(key, ckey)) return
      const cnode = tre[ckey]
      if (!cnode) return
      barn[ckey] = {
        tittel: cnode.tittel,
        sortering: cnode.sortering,
        intervall: cnode.intervall,
        normalisertVerdi: cnode.normalisertVerdi,
        skjul: cnode.skjul,
        farge: cnode.farge
      }
    })
  }
  node.barn = barn
}

// Om den underliggende koden er definert som en relasjon
function erRelasjon(key, ckey) {
  if (ckey === "NN-LA-TI-AP") debugger
  const nodeFra = tre[key]
  if (nodeFra.flagg && nodeFra.flagg[ckey]) return true
  const graf = nodeFra.graf
  if (!graf) return false
  for (var gkey in graf) {
    const relasjon = graf[gkey]
    for (var relkey in relasjon)
      if (relkey == ckey) {
        return true
      }
  }
  return false
}

function settInn(tre, node, kode) {
  const segments = typesystem.splittKode(node.kode.toLowerCase())
  if (segments.length === 0) {
    Object.keys(node).forEach(key => {
      tre[key] = Object.assign({}, tre[key], node[key])
    })
    return
  }
  for (let i = 0; i < segments.length - 1; i++) {
    const subKey = segments[i]
    if (!tre[subKey]) tre[subKey] = {}
    tre = tre[subKey]
  }

  const leafKey = segments[segments.length - 1]
  tre[leafKey] = Object.assign({}, tre[leafKey], node)
}

function injectAlias(from, kode, tre) {
  const targetNode = tre[kode]
  const targetSti = sti(kode)
  if (targetSti === from.join("/").toLowerCase()) return
  for (let i = 0; i < from.length - 1; i++) {
    const subKey = from[i].toLowerCase()
    if (!tre[subKey]) tre[subKey] = {}
    tre = tre[subKey]
    if (!subKey) throw new Error(JSON.stringify(from))
  }
  const leafKey = from[from.length - 1].toLowerCase()
  if (!leafKey) throw new Error(JSON.stringify(from))
  if (!tre[leafKey]) tre[leafKey] = {}
  const leafNode = tre[leafKey]
  if (!leafNode.se) leafNode.se = {}
  if (!targetNode)
    throw new Error(JSON.stringify(from) + JSON.stringify(targetNode))
  leafNode.se[targetNode.kode] = {
    tittel: targetNode.tittel,
    sti: sti(targetNode.kode)
  }
}

function settInnAlias(tre, kode, tittel) {
  if (!tittel) return
  const kodePath = typesystem.medGyldigeTegn(tittel.toLowerCase())
  if (kodePath.length === 0) throw new Error(tittel)
  injectAlias([kodePath], kode, tre)
}

function lagRedirectFraTittel(tre) {
  Object.keys(tre).forEach(kode => {
    const node = tre[kode]
    settInnAlias(tre, kode, node.tittel.nb)
    settInnAlias(tre, kode, node.tittel.la)
    settInnAlias(tre, kode, node.tittel.en)
  })
}

function fjernEnkeltVerneområder(tre) {
  // Fjern barn fra VV - for mange, bruk alternative ruter
  const vv = tre.VV.barn
  const filter = /^VV-\d+$/
  Object.keys(vv).forEach(kode => {
    if (kode.match(filter)) delete vv[kode]
  })
}
