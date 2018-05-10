const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let data = io.lesDatafil("full_med_graf")

function settInn(kode, forelder, tittel) {
  r.push({ kode: kode, forelder: forelder, tittel: tittel })
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
      foreldre.forEach(forelder => settInn(kode, forelder, node.tittel))
    }
  }
})

function finn(kode) {
  return r.filter(node => node.kode === kode)
}

function valider(kode) {
  const node = finn(kode)
  if (!node) throw new Error("Mangler " + kode)
  console.log(node)
}

valider("NA")

io.skrivBuildfil(__filename, r)
