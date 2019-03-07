const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")

let na = io.lesDatafil("na_hovedtype")
let r = {}

const lkmTekst = {
  u: "underordnet miljøvariabel",
  h: "hoved-miljøvariabel",
  t: "tilleggs-miljøvariabel",
  d: "differensierende miljøvariabel"
}

function relasjon(node, kant, kode, kantRetur = "definerer hovedtype") {
  node.relasjon.push({
    kode: kode,
    kant: kant,
    kantRetur: kantRetur,
    erSubset: true
  })
}

function map(ht) {
  let o = {
    ingress: ht.ingress,
    infoUrl: ht.infoUrl,
    relasjon: []
  }

  relasjon(o, "definisjonsgrunnlag", ht.definisjonsgrunnlag.kode)
  relasjon(o, "prosedyrekategori", ht.prosedyrekategori.kode)
  if (!ht.lkm) return o
  Object.keys(ht.lkm).forEach(lkmtype => {
    ht.lkm[lkmtype].forEach(kode => {
      relasjon(o, lkmTekst[lkmtype], kode)
    })
  })
  return o
}

Object.keys(na).forEach(kode => {
  r[kode] = map(na[kode])
})

io.skrivDatafil(__filename, r)
