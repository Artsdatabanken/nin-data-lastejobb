const { io } = require("lastejobb")
const typesystem = require("@artsdatabanken/typesystem")

let tre = io.lesDatafil("full_med_graf")

let r = []
Object.keys(tre).forEach(key => {
  const node = tre[key]
  if (node.se) {
  } else {
    const kode = key
    let foreldre = node.foreldre
    if (!foreldre) foreldre = []
    if (kode === typesystem.rotkode) settInn(kode, null, node.tittel)
    if (foreldre.length > 0) {
      foreldre.forEach(forelder =>
        settInn(kode, forelder, node.tittel, lagDelAv(node))
      )
    }
  }
})
io.skrivBuildfil(__filename, r)

function settInn(kode, forelder, tittel, delAv) {
  const node = { kode: kode, forelder: forelder, tittel: tittel }
  if (delAv) node.delAv = delAv
  r.push(node)
}

function lagDelAv(node) {
  const delAv = []
  if (!node.graf) return []
  Object.keys(node.graf).forEach(kant => {
    const relaterte = node.graf[kant]
    Object.keys(relaterte).forEach(kode => {
      const relatert = relaterte[kode]
      if (relatert.erSubset) delAv.push(kode)
    })
  })
  return delAv
}
