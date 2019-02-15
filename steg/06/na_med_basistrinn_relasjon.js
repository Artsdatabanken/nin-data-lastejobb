const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")

let na = io.lesDatafil("na_med_hovedtype_relasjon")
let mi = io.lesDatafil("na_mi_liste")
let basistrinn = io.lesDatafil("na_grunntype_til_lkm")

function relasjon(node, kant, kode, kantRetur = "defineres av") {
  if (!node.relasjon) node.relasjon = []
  node.relasjon.push({
    kode: kode,
    kant: kant,
    kantRetur: kantRetur,
    erSubset: false
  })
}

Object.keys(mi).forEach(kode => (na[kode] = mi[kode]))

const ht = {}

Object.keys(basistrinn).forEach(grunntype => {
  const mier = basistrinn[grunntype]
  mier.forEach(mi => {
    const hovedtype = mor(grunntype)
    const lkmkode = mor(mi)
    const lkm = na[lkmkode]
    relasjon(na[grunntype], lkm.tittel.nb, mi, "definerer")
    if (!ht[hovedtype]) ht[hovedtype] = {}
    ht[hovedtype][lkmkode] = true
  })
})

delete ht["NN-NA"]

console.log(ht["NN-NA-T1"])
Object.keys(ht).forEach(hovedtype => {
  Object.keys(ht[hovedtype]).forEach(lkm =>
    relasjon(na[hovedtype], "defineres av", lkm, "definerer")
  )
})

/*Object.keys(lkm).forEach(kode => {
  relasjon(na[kode], "definerer", lkm[kode], "defineres av")
})*/

function mor(kode) {
  const i = kode.lastIndexOf("-")
  return kode.substring(0, i)
}

io.skrivDatafil(__filename, na)
