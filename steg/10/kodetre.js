const { io } = require("lastejobb")
const typesystem = require("@artsdatabanken/typesystem")

let data = io.lesDatafil("full_med_graf")

function settInn(kode, forelder, tittel, delAv) {
  const node = { kode: kode, forelder: forelder, tittel: tittel }
  if (delAv) node.delAv = delAv
  r.push(node)
}

let r = []
Object.keys(data).forEach(key => {
  const node = data[key]
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

io.skrivBuildfil(__filename, r)
