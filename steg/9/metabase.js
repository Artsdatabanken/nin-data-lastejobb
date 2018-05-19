const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")
const tinyColor = require("tinycolor2")

function harKartData(kode) {
  if (kode.indexOf("VV") >= 0) return true
  if (!data[kode]) return false

  return data[kode].bbox
}

let slettet_fordi_mangler_bbox = []
let data = io.lesDatafil("metabase_med_bbox")

Object.keys(data).forEach(kode => {
  const node = data[kode]
  node.kode = kode
  if (!harKartData(kode)) {
    delete data[kode]
    slettet_fordi_mangler_bbox.push(kode)
  }
})

function fjernRelasjonTilKoderSomIkkeHarData(data) {
  Object.keys(data).forEach(parent => {
    const node = data[parent]
    if (!node.graf) return
    Object.keys(node.graf).forEach(kode => {
      Object.keys(node.graf[kode]).forEach(relatertKode => {
        if (harKartData(relatertKode)) return
        //      log.warn(`Fjerner relasjon til node som mangler data '${relatertKode}'`)
        delete node.graf[kode][relatertKode]
      })
    })
  })
}

function sti(kode) {
  return typesystem
    .splittKode(kode)
    .join("/")
    .toLowerCase()
}

let ukjenteKoder = []

function fyllInnGraf() {
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
        sub.sti = sti(kode)
        sub.farge = data[kode].farge
      })
    })
  })
}

function settPrimærSti() {
  Object.keys(data).forEach(kode => {
    const node = data[kode]
    node.sti = sti(kode)
  })
}

var p2c = {},
  c2p = {}

function mapForelderTilBarn(kode, node) {
  if (!c2p[kode]) c2p[kode] = []
  if (!node.foreldre) {
    if (!node.se) {
      log.warn(node)
      throw new Error("Mangler forelder: " + kode)
    }
    return
  } else {
    let foreldre = node.foreldre
    foreldre.forEach(forelderkode => {
      if (!p2c[forelderkode]) p2c[forelderkode] = []
      p2c[forelderkode].push(kode)
      if (!c2p[kode].includes(forelderkode)) c2p[kode].push(forelderkode)
    })
    if (node.barn)
      node.barn.forEach(barnkode => {
        if (!p2c[kode]) p2c[kode] = []
        if (!c2p[barnkode]) c2p[barnkode] = []
        if (!c2p[barnkode].includes(kode)) c2p[barnkode].push(kode)
        if (!p2c[kode].includes(barnkode)) c2p[kode].push(barnkode)
        p2c[kode].push(barnkode)
      })
  }
}

function mapForeldreTilBarn() {
  Object.keys(data).forEach(kode => {
    const node = data[kode]
    mapForelderTilBarn(kode, node)
  })
}

function hentKey(key) {
  let node = data[key]
  //  if (node.se) return node.se
  return key
}

function nøstOppForfedre(forelderkey) {
  let r = []
  while (forelderkey) {
    forelderkey = hentKey(forelderkey)
    let forelder = data[forelderkey]
    if (!forelder) {
      log.warn("Mangler kode " + forelderkey)
      return
    }
    r.push({ kode: forelderkey, tittel: forelder.tittel, sti: forelder.sti })
    forelderkey = c2p[forelderkey][0]
  }
  return r
}

function fjernPrefiks(kode, rotkode) {
  const før = kode
  kode = kode.replace(rotkode, "")
  if ("/_-".indexOf(kode[0]) >= 0) kode = kode.substring(1)
  return kode
}

let tempCounter = 0
let tempColors = [
  "#d53e4f",
  "#f46d43",
  "#fdae61",
  "#fee08b",
  "#e6f598",
  "#abdda4",
  "#66c2a5",
  "#3288bd"
]

function tilfeldigFarge() {
  const i = tempCounter++ % tempColors.length
  return tempColors[i]
}

function tilordneFarger(barna, rotFarge) {
  if (!rotFarge) rotFarge = tilfeldigFarge()
  let farge = new tinyColor(rotFarge)
  Object.keys(barna).forEach(bkode => {
    const barn = barna[bkode]
    let minFarge = data[bkode].farge
    if (!minFarge) {
      const tilordneTilfeldigeFarger =
        "NA_MI_BS_".indexOf(bkode.substring(0, 2)) >= 0
      if (tilordneTilfeldigeFarger) minFarge = farge.spin(15).toHexString()
    }
    if (minFarge) barn.farge = minFarge
  })
}

function byggTreFra(tre, key) {
  let rot = data[key]
  if (!rot) throw new Error("Finner ikke " + key)
  //  if (!rot.farge) rot.farge = tilfeldigFarge()
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

  if (p2c[key]) {
    p2c[key].forEach(ckey => {
      // TODO: Temp hack: Fjerner de enkelte verneområder fra toppnivå VV
      if (key === "VV" && ckey.match(/^VV_\d+$/)) return
      const cnode = data[ckey]
      barn[ckey] = {
        sti: cnode.sti,
        tittel: cnode.tittel
      }
      const child = byggTreFra(tre, ckey)
    })
  }
  tilordneFarger(barn, rot.farge)
  node["@"].barn = barn
  settInn(tre, node, key, rot)
  return node
}

function erLovligNøkkel(key) {
  const invalid = "$#[]/.".split("")
  for (let c of invalid) if (key.indexOf(c) >= 0) return false
  return true
}

function settInn(tre, targetNode, kode, node) {
  const sti = targetNode["@"].sti.toLowerCase()
  if (sti.length === 0) {
    Object.keys(targetNode).forEach(key => {
      tre[key] = Object.assign({}, tre[key], targetNode[key])
      if (!erLovligNøkkel(key))
        throw new Error("kode " + kode + " har ulovlig nøkkel " + key)
    })
    return
  }
  const segments = sti.split("/")

  for (let i = 0; i < segments.length - 1; i++) {
    const subKey = segments[i]
    if (!tre[subKey]) tre[subKey] = {}
    tre = tre[subKey]
  }

  const leafKey = segments[segments.length - 1]
  tre[leafKey] = Object.assign({}, tre[leafKey], targetNode)
}

function injectAlias(from, kode, tre) {
  const targetNode = data[kode]
  if (targetNode.sti.toLowerCase() === from.join("/").toLowerCase()) return
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
    sti: targetNode.sti
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

function injectNamedAliases(tre) {
  Object.keys(data).forEach(kode => {
    const node = data[kode]
    settInnAlias(tre, kode, node.tittel.nb)
    settInnAlias(tre, kode, node.tittel.la)
    settInnAlias(tre, kode, node.tittel.en)
  })
}

function validateKeys(tre, path) {
  if (tre instanceof Object && tre.constructor === Object)
    Object.keys(tre).forEach(key => {
      const newPath = path + "." + key
      if (!erLovligNøkkel(key)) log.error("invalid key:", newPath)
      validateKeys(tre[key], newPath)
    })
  if (Array.isArray(tre)) {
    tre.forEach(item => validateKeys(item, path + "[]"))
  }
}

fjernRelasjonTilKoderSomIkkeHarData(data)
settPrimærSti()
mapForeldreTilBarn()

let tre = {}
let node = byggTreFra(tre, typesystem.rotkode)
settInnAliaser(tre)
injectNamedAliases(tre)
fyllInnGraf()

log.warn(tre.vv)
log.info("Mangler bbox for " + slettet_fordi_mangler_bbox.length + " koder")
//log.debug("Mangler bbox for: " + JSON.stringify(slettet_fordi_mangler_bbox))
log.warn("Kobling til +" + ukjenteKoder.length + " ukjente koder")
//log.debug("Kobling til ukjente koder: " + JSON.stringify(ukjenteKoder))
tre = { katalog: tre }
io.skrivBuildfil(__filename, tre)

validateKeys(tre, "")
