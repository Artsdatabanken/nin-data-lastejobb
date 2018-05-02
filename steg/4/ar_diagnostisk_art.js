if (!process.env.DEBUG) process.env.DEBUG = "*"
const path = require("path")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")

log.logLevel = 6

let diagArt = io.lesKildedatafil(config.datakilde.na_diagnostisk_art)
let arter = io.lesDatafil("ar_taxon")
let nin_liste = io.lesDatafil("na_kode")

let r = {}

function linkOne(nodeFra, nodeTil, funksjon, tag) {
  const variabel = funksjon
    .replace(tag, "")
    .replace("[", "")
    .replace("]", "")

  const kodeFra = nodeFra.kode
  const kodeTil = nodeTil.kode
  if (!kodeFra) throw new Error("Mangler kode: " + JSON.stringify(nodeFra))
  if (!kodeTil) throw new Error("Mangler kode: " + JSON.stringify(nodeTil))
  if (!r[kodeFra]) r[kodeFra] = { relasjon: {} }
  const relasjon = r[kodeFra].relasjon
  if (!relasjon[tag]) relasjon[tag] = []
  relasjon[tag] = {
    kodeTil: {
      tittel: nodeTil.tittel,
      variabel: variabel
    }
  }
}

function linkBoth(node1, node2, funksjon, tag) {
  if (!tag) return
  if (!funksjon) return
  tag = tag.trim().replace(" ", "_")
  funksjon = funksjon.trim()
  linkOne(node1, node2, funksjon, tag)
  linkOne(node2, node1, funksjon, tag)
}

let ukjenteKoder = {}
let ukjenteArter = {}

Object.keys(diagArt).forEach(key => {
  const art = diagArt[key]
  if (!art) throw new Error("Mangler art " + key)
  const hovedtype =
    config.kodesystem.prefix.natursystem + art.Kartleggingsenhet.split("-")[0]
  const na_kode =
    config.kodesystem.prefix.natursystem + art.Kartleggingsenhet.trim()
  if (!nin_liste[na_kode])
    ukjenteKoder[na_kode] = ukjenteKoder[na_kode]
      ? ukjenteKoder[na_kode] + 1
      : 1
  else {
    const idkode = typesystem.Art.lagKode(art.scientificNameID)
    if (arter[idkode]) {
      //      const tx_kode = arter[idkode].se
      const na = nin_liste[na_kode]
      na.kode = na_kode
      let tx = arter[idkode]
      tx.kode = idkode
      if (tx.se) tx = arter[tx.se]
      let e = {}
      linkBoth(na, tx, art["Funksjon1"], art["tags1"])
      linkBoth(na, tx, art["Funksjon2"], art["tags2"])
      linkBoth(na, tx, art["Funksjon3"], art["tags3"])
      linkBoth(na, tx, art["Funksjon 4"], art["tags4"])
    } else {
      ukjenteArter[idkode] = ukjenteArter[idkode] ? ukjenteArter[idkode] + 1 : 1
    }
  }
})

log.warn("Ukjente koder", ukjenteKoder)
log.warn("Ukjente arter", Object.keys(ukjenteArter).length)
io.skrivDatafil(__filename, r)
