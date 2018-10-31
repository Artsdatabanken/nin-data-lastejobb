const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let data = io.lesDatafil("metabase_bbox")
let hierarki = io.lesDatafil("kodehierarki")
const barnAv = hierarki.barn
const foreldreTil = hierarki.foreldre

function sti(kode) {
  return typesystem
    .splittKode(kode)
    .join("/")
    .toLowerCase()
}

let ukjenteKoder = []

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
      log.warn("Mangler kode " + forelderkey)
      return
    }
    r.push({ kode: forelderkey, tittel: forelder.tittel })
    forelderkey = foreldreTil[forelderkey][0]
  }
  return r
}

function fjernPrefiks(kode, rotkode) {
  const før = kode
  kode = kode.replace(rotkode, "")
  if ("/_-".indexOf(kode[0]) >= 0) kode = kode.substring(1)
  return kode
}

function byggTreFra(tre, key) {
  let rot = data[key]
  if (!rot) throw new Error("Finner ikke " + key)
  if (!rot.overordnet) {
    if (!rot.foreldre) {
      log.warn("mangler forelder: " + key)
    }
    rot.overordnet =
      rot.foreldre && rot.foreldre.length > 0
        ? nøstOppForfedre(rot.foreldre[0])
        : ""
    delete rot.foreldre
  }
  let node = { "@": rot }
  let barn = {}

  if (barnAv[key]) {
    barnAv[key].forEach(ckey => {
      const cnode = data[ckey]
      if (!cnode) return
      barn[ckey] = {
        tittel: cnode.tittel,
        sortering: cnode.sortering,
        skjul: cnode.skjul
      }
      const child = byggTreFra(tre, ckey)
    })
  }
  node["@"].barn = barn
  settInn(tre, node, key)
  return node
}

function settInn(tre, node, kode) {
  const segments = typesystem.splittKode(node["@"].kode.toLowerCase())
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
  if (!leafNode["@"]) leafNode["@"] = {}
  const me = leafNode["@"]
  if (!me.se) me.se = {}
  if (!targetNode)
    throw new Error(JSON.stringify(from) + JSON.stringify(targetNode))
  me.se[targetNode.kode] = {
    tittel: targetNode.tittel,
    sti: sti(targetNode.kode)
  }
}

function settInnAliaser(tre) {
  Object.keys(data).forEach(kode => {
    const node = data[kode]
    const kodePath = typesystem.splittKode(kode.toLowerCase())
    injectAlias(kodePath, kode, tre)
    injectAlias([kode], kode, tre)
  })
}

let acc = {}
function settInnAlias(tre, kode, tittel) {
  if (!tittel) return
  const kodePath = typesystem.medGyldigeTegn(tittel.toLowerCase())
  kodePath.split("").forEach(c => {
    if (!acc[c]) acc[c] = 1
    else acc[c] = acc[c] + 1
  })
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
  const vv = tre.vv["@"].barn
  const keys = Object.keys(vv)
  const vid = /^VV_\d+$/
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

zoomlevels(typesystem.rotkode)

let tre = {}
let node = byggTreFra(tre, typesystem.rotkode)
settInnAliaser(tre)
lagRedirectFraTittel(tre)
fjernEnkeltVerneområder(tre)
settFargePåRelasjoner()

if (ukjenteKoder.length > 0)
  log.warn("Kobling til +" + ukjenteKoder.length + " ukjente koder")
tre = { katalog: tre }
io.skrivDatafil(__filename, tre)
