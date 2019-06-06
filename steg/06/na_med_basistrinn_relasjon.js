const { io } = require("lastejobb")

let basistrinn = io.lesDatafil("na_grunntype_til_lkm")

const na = flettNatursystemOgLkm()
const ht = {}

Object.keys(basistrinn).forEach(grunntype => {
  const mier = basistrinn[grunntype]
  mier.forEach(mi => {
    const hovedtype = mor(grunntype)
    const lkmkode = mor(mi)
    const lkm = na[lkmkode]
    relasjon(na[grunntype], lkm.tittel.nb, mi, "definerer grunntype")
    if (!ht[hovedtype]) ht[hovedtype] = {}
    ht[hovedtype][lkmkode] = true
  })
})

delete ht["NN-NA"]

function flettNatursystemOgLkm() {
  let na = io.lesDatafil("na_med_hovedtype_relasjon")
  let mi = io.lesDatafil("na_mi_liste")
  Object.keys(mi).forEach(kode => {
    na[kode] = Object.assign(na[kode] || {}, mi[kode])
  })
  return na
}

function relasjon(node, kant, kode, kantRetur = "defineres av") {
  if (!node.relasjon) node.relasjon = []
  node.relasjon.push({
    kode: kode,
    kant: kant,
    kantRetur: kantRetur,
    erSubset: false
  })
}

function mor(kode) {
  const i = kode.lastIndexOf("-")
  return kode.substring(0, i)
}

io.skrivDatafil(__filename, na)
