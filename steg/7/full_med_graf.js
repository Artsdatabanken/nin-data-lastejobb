const config = require("../../config")
const koder = require("../../lib/koder")
const io = require("../../lib/io")
const log = require("log-less-fancy")()

let full = io.lesDatafil("full")

function tilBarn(node) {
  return {
    tittel: node.tittel
  }
}

function lagRelasjonBeggeVeier(kode, node) {
  node.graf = {}
  Object.keys(node.relasjon).forEach(kategori => {
    node.graf[kategori] = {}
    const koder = node.relasjon[kategori]
    Object.keys(koder).forEach(bkode => {
      const o = koder[bkode]
      //      const bkode = o.kode
      if (!bkode) throw new Error("Mangler kode " + o)
      const b = full[bkode]
      if (b) {
        if (!b.graf) b.graf = {}
        if (!b.graf[kategori]) b.graf[kategori] = {}
        b.graf[kategori][kode] = Object.assign(tilBarn(node), o)
        node.graf[kategori][bkode] = Object.assign(tilBarn(b), o)
      } else log.warn("Mangler kode " + bkode)
    })
  })
  delete node.relasjon
}

Object.keys(full).forEach(key => {
  const node = full[key]
  if (node.relasjon) lagRelasjonBeggeVeier(key, node)
})

io.skrivDatafil(__filename, full)
