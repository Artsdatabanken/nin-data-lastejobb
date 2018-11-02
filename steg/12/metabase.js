const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let data = io.lesDatafil("metabase_bbox")
let hierarki = io.lesDatafil("kodehierarki")
const barnAv = hierarki.barn
const foreldreTil = hierarki.foreldre

let ukjenteKoder = []
let manglerKode = []
zoomlevels(typesystem.rotkode)

let tre = {}
Object.keys(data).forEach(kode => (tre[kode] = map(kode)))

lagRedirectFraTittel(tre)
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
  Object.keys(data).forEach(kode => {
    const node = data[kode]
    if (!node.graf) return
    Object.keys(node.graf).forEach(typeRelasjon => {
      Object.keys(node.graf[typeRelasjon]).forEach(kode => {
        if (!data[kode]) {
          ukjenteKoder.push(kode)
          return
        }
        const sub = node.graf[typeRelasjon][kode]
        sub.farge = data[kode].farge
      })
    })
  })
}

function nøstOppForfedre(forelderkey) {
  let r = []
  while (forelderkey) {
    let forelder = data[forelderkey]
    if (!forelder) {
      manglerKode[forelderkey] = true
      return
    }
    r.push({ kode: forelderkey, tittel: forelder.tittel })
    const forfedre = foreldreTil[forelderkey]
    if (!forfedre) return r
    if (forfedre.length <= 0) return r
    forelderkey = forfedre[0]
  }
  return r
}

function map(key) {
  let node = data[key]
  if (!node) throw new Error("Finner ikke " + key)
  if (!node.overordnet) {
    if (!node.foreldre) {
      log.warn("mangler forelder: " + key)
    }
    node.overordnet =
      node.foreldre && node.foreldre.length > 0
        ? nøstOppForfedre(node.foreldre[0])
        : ""
    delete node.foreldre
  }

  let barn = {}
  if (barnAv[key]) {
    barnAv[key].forEach(ckey => {
      if (erRelasjon(key, ckey)) return
      const cnode = data[ckey]
      if (!cnode) return
      barn[ckey] = {
        tittel: cnode.tittel,
        sortering: cnode.sortering,
        skjul: cnode.skjul,
        farge: cnode.farge
      }
    })
  }
  node.barn = barn
  return node
}

// Om den underliggende koden er definert som en relasjon
function erRelasjon(key, ckey) {
  const graf = data[key].graf
  if (!graf) return false
  for (var gkey in graf) {
    const relasjon = graf[gkey]
    for (var relkey in relasjon) if (relkey == ckey) return true
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
  const targetNode = data[kode]
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
  Object.keys(data).forEach(kode => {
    const node = data[kode]
    settInnAlias(tre, kode, node.tittel.nb)
    settInnAlias(tre, kode, node.tittel.la)
    settInnAlias(tre, kode, node.tittel.en)
  })
}

function fjernEnkeltVerneområder(tre) {
  // Fjern barn fra VV - for mange, bruk alternative ruter
  const vv = tre.VV.barn
  const keys = Object.keys(vv)
  const vid = /^VV-\d+$/
  keys.forEach(kode => {
    if (kode.match(vid)) delete vv[kode]
  })
}

function zoomlevels(kode, bbox, zoom) {
  if (!barnAv[kode]) return
  barnAv[kode].forEach(bkode => {
    const barn = data[bkode]
    if (barn) {
      barn.bbox = barn.bbox || bbox
      barn.zoom = barn.zoom || zoom
      if (!barn) console.error(kode, bbox, zoom, barnAv[kode])
    }
  })
}
