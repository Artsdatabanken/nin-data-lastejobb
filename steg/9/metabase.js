const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")
const tinyColor = require("tinycolor2")

let data = io.lesDatafil("metabase_med_bbox")
Object.keys(data).forEach(kode => {
  data[kode].kode = kode
})

function sti(kode) {
  return typesystem
    .splittKode(kode)
    .join("/")
    .toLowerCase()
}

function fyllInnGraf() {
  Object.keys(data).forEach(kode => {
    const node = data[kode]
    if (node.graf)
      Object.keys(node.graf).forEach(key => {
        Object.keys(node.graf[key]).forEach(kode => {
          const sub = node.graf[key][kode]
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

function mapForeldreTilBarn() {
  Object.keys(data).forEach(kode => {
    const node = data[kode]
    if (!c2p[kode]) c2p[kode] = []
    if (!node.foreldre) {
      if (!node.se) {
        log.warn(node)
        throw new Error("Mangler forelder: " + kode)
      }
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
  })
}

function tittel(node) {
  const tittel = node.tittel
  if (!tittel) throw new Error("Mangler tittel: " + JSON.stringify(node))
  if (tittel.nb) return tittel.nb
  if (tittel.en) return tittel.en
  if (tittel.la) return tittel.la
  return node.kode
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
    r.push({ kode: forelder.kode, tittel: forelder.tittel, sti: forelder.sti })
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

function tilordneFarger(barn, rotFarge) {
  let farge = new tinyColor(rotFarge)
  Object.keys(barn).forEach(bkode => {
    const minFarge = data[bkode].farge
    if (!barn[bkode].farge) {
      barn[bkode].farge = minFarge ? minFarge : farge.spin(15).toHexString()
    }
  })
}

function byggTreFra(tre, key) {
  let rot = data[key]
  if (!rot) throw new Error("Finner ikke " + key)
  // rot.kode = key
  if (!rot.farge) rot.farge = tilfeldigFarge()
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
      const cnode = data[ckey]
      const ckode = cnode.kode
      barn[ckey] = {
        sti: cnode.sti,
        kode: ckode,
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

function injectAlias(from, targetNode, tre) {
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
  if (!targetNode.kode)
    throw new Error(JSON.stringify(from) + JSON.stringify(targetNode))
  me.se[targetNode.kode] = {
    tittel: targetNode.tittel,
    sti: targetNode.sti
  }
}

function injectKodeAliases(tre) {
  Object.keys(data).forEach(kode => {
    const node = data[kode]
    const kodePath = typesystem.splittKode(kode.toLowerCase())
    injectAlias(kodePath, node, tre)
    injectAlias([kode], node, tre)
  })
}

let acc = {}
function injectNamedAlias(tre, node, tittel) {
  if (!tittel) return
  const kodePath = typesystem.medGyldigeTegn(tittel.toLowerCase())
  kodePath.split("").forEach(c => {
    if (!acc[c]) acc[c] = 1
    else acc[c] = acc[c] + 1
  })
  if (kodePath.length === 0) throw new Error(tittel)
  injectAlias([kodePath], node, tre)
}

function injectNamedAliases(tre) {
  Object.keys(data).forEach(kode => {
    const node = data[kode]
    injectNamedAlias(tre, node, node.tittel.nb)
    injectNamedAlias(tre, node, node.tittel.la)
    injectNamedAlias(tre, node, node.tittel.en)
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

settPrimærSti()
mapForeldreTilBarn()

let tre = {}
let node = byggTreFra(tre, config.kodesystem.rotkode)
injectKodeAliases(tre)
injectNamedAliases(tre)
fyllInnGraf()

tre = { katalog: tre }
io.skrivBuildfil(__filename, tre)

validateKeys(tre, "")

//console.log(JSON.stringify(tre.katalog.na.t["@"]))
