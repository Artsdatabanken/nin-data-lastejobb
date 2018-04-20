if (!process.env.DEBUG) process.env.DEBUG = "*"
const path = require("path")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const { kodkode, splittKode, lookup } = require("../../lib/koder")
const koder = require("../../lib/koder")

log.logLevel = 6

let diagArt = io.lesKildedatafil(config.datakilde.NA_diagnostisk_art)
let arter = io.lesDatafil("AR_taxon")
let nin_liste = io.lesDatafil("NA_kode")

let r = {}

function linkOne(nodeFra, nodeTil, funksjon, tag) {
  const variabel = funksjon
    .replace(tag, "")
    .replace("[", "")
    .replace("]", "")

  const kodeFra = nodeFra.kode
  const kodeTil = nodeTil.kode
  if (!r[kodeFra]) r[kodeFra] = { relasjon: {} }
  const relasjon = r[kodeFra].relasjon
  if (!relasjon[tag]) relasjon[tag] = {}
  relasjon[tag][kodeTil] = {
    kode: kodeTil,
    tittel: nodeTil.tittel,
    variabel: variabel
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
  const hovedtype =
    config.kodesystem.prefix.natursystem + art.Kartleggingsenhet.split("-")[0]
  const na_kode =
    config.kodesystem.prefix.natursystem + art.Kartleggingsenhet.trim()
  if (!nin_liste[na_kode])
    ukjenteKoder[na_kode] = ukjenteKoder[na_kode]
      ? ukjenteKoder[na_kode] + 1
      : 1
  else {
    const idkode = koder.artskode(art.scientificNameID, art.Scientificname)
    if (arter[idkode]) {
      //      const tx_kode = arter[idkode].se
      const na = nin_liste[na_kode]
      tx = arter[idkode]
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
