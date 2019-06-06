const { io } = require("lastejobb")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let tre = io.lesDatafil("metabase_med_farger")
let hierarki = io.lesDatafil("kodehierarki")
const foreldreTil = hierarki.foreldre

let ukjenteKoder = []
let manglerKode = []

Object.keys(tre).forEach(kode => mapOverordnet(kode))

if (false) lagRedirectFraTittel(tre)

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
