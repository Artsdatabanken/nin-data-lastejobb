const { io } = require("lastejobb")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let tre = io.lesDatafil("metabase_med_url")
let hierarki = io.lesDatafil("kodehierarki")
const foreldreTil = hierarki.foreldre

let ukjenteKoder = []
let manglerKode = []

Object.keys(tre).forEach(kode => mapOverordnet(kode))

settFargePåRelasjoner()

if (ukjenteKoder.length > 0)
  log.warn("Kobling til +" + ukjenteKoder.length + " ukjente koder")
if (Object.keys(manglerKode).length > 0)
  log.warn("Mangler kode " + Object.keys(manglerKode))

Object.keys(tre).forEach(kode => oppdaterNivå(tre[kode]))
io.skrivDatafil(__filename, tre)

function oppdaterNivå(node) {
  oppdaterNivå1(node)
  const undernivå = typesystem.hentNivaa(node.ll + "/x")
  if (undernivå) node.undernivå = undernivå[0]
  node.overordnet.forEach(ov => {
    const src = tre[ov.kode]
    ov.nivå = src.nivå
    ov.url = src.url
  })
}

function oppdaterNivå1(node) {
  if (node.url === "/") return
  if (node.url.indexOf("Biota") >= 0) return
  if (node.url.indexOf("Administrativ_grense") >= 0) return
  if (node.url.indexOf("Naturvernområde") >= 0) return
  if (node.url.indexOf("Datakilde") >= 0) return
  if (node.url.indexOf("Truet_art_natur") >= 0) return
  if (node.url.indexOf("Landskap") >= 0) return

  node.nivå = node.nivå || typesystem.hentNivaa(node.url)[0]
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
