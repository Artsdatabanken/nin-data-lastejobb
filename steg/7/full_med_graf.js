const config = require("../../config")
const koder = require("../../lib/koder")
const io = require("../../lib/io")
const log = require("log-less-fancy")()

let full = io.lesDatafil("full")

function tilBarn(node) {
  return {
    kode: node.kode,
    sti: node.sti,
    farge: node.farge,
    tittel: node.tittel
  }
}
function lagRelasjonBeggeVeier(kode, node) {
  node.graf = {}
  Object.keys(node.relasjon).forEach(kategori => {
    node.graf[kategori] = {}
    const koder = node.relasjon[kategori]
    koder.forEach(o => {
      const bkode = o.kode
      if (!bkode) throw new Error("Mangler kode " + o)
      const b = full[bkode]
      if (bkode === "VV_VP-RL") {
        log.warn(node)
        log.warn(b)
      }
      if (b) {
        if (!b.graf) b.graf = {}
        if (!b.graf[kategori]) b.graf[kategori] = {}
        b.graf[kategori][kode] = Object.assign(o, tilBarn(node))
        node.graf[kategori][bkode] = Object.assign(o, tilBarn(b))
      } else log.warn("Mangler kode " + bkode)
    })
  })
}

Object.keys(full).forEach(key => {
  const node = full[key]
  if (node.relasjon) lagRelasjonBeggeVeier(key, node)
})

io.skrivDatafil(__filename, full)
