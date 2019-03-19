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
let na_overstyr_hierarki = io.lesDatafil("na_overstyr_hierarki")

let r = {}

// TODO:
const map = {
  mengdeart: true,
  kjennetegnende_tyngdepunktart: true,
  tyngdepunktart: true,
  vanlig_art: true,
  dominerende_mengdeart: true,
  absolutt_skilleart: true,
  "svak_relativ skilleart": true,
  "sterk_relativ skilleart": true,
  konstant_art: true,
  skilleart: true,
  "gradient-tyngdepunktart": true
}

function linkOne(kodeFra, kodeTil, funksjon, tag) {
  const variabel = tag

  if (!kodeFra) throw new Error("Mangler kode: " + kodeFra)
  if (!kodeTil) throw new Error("Mangler kode: " + kodeTil)
  if (!r[kodeFra]) r[kodeFra] = { relasjon: [] }
  const relasjon = r[kodeFra].relasjon
  if (relasjon[kodeTil]) throw new Error(".")
  relasjon.push({
    kode: kodeTil,
    kant: variabel,
    kantRetur: "Habitat"
  })
}

function linkBoth(node1, node2, funksjon, tag) {
  if (!tag) return
  if (!funksjon) return
  tag = tag.trim().replace(" ", "_")
  funksjon = funksjon.trim()
  linkOne(node1, node2, funksjon, tag)
}

let ukjenteKoder = {}
let ukjenteArter = {}

Object.keys(diagArt).forEach(key => {
  const art = diagArt[key]
  if (!art) throw new Error("Mangler art " + key)
  const hovedtype = typesystem.natursystem.leggTilPrefiks(
    art.Kartleggingsenhet.split("-")[0]
  )
  const na_kode = typesystem.natursystem.leggTilPrefiks(
    art.Kartleggingsenhet.trim()
  )
  if (!nin_liste[na_kode])
    ukjenteKoder[na_kode] = ukjenteKoder[na_kode]
      ? ukjenteKoder[na_kode] + 1
      : 1
  else {
    const sciId = typesystem.art.lagKode(art.scientificNameID)
    let tx = arter[sciId]
    if (arter[sciId]) {
      linkBoth(na_kode, sciId, art["Funksjon1"], art["tags1"])
      linkBoth(na_kode, sciId, art["Funksjon2"], art["tags2"])
      linkBoth(na_kode, sciId, art["Funksjon3"], art["tags3"])
      linkBoth(na_kode, sciId, art["Funksjon 4"], art["tags4"])
    } else {
      ukjenteArter[sciId] = ukjenteArter[sciId] ? ukjenteArter[sciId] + 1 : 1
    }
  }
})

if (ukjenteKoder) log.warn("Ukjente naturtyper", ukjenteKoder)
if (Object.keys(ukjenteArter).length > 0)
  log.warn("Ukjente arter", Object.keys(ukjenteArter).length)
io.skrivDatafil(__filename, r)
