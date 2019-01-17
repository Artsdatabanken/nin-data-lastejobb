const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let tre = io.lesDatafil("metabase_tweaks")
Object.keys(tre).forEach(kode => addUrl(kode, tre[kode]))
io.skrivDatafil(__filename, tre)

function addUrl(kode, node) {
  node.url = url(kode)
  if (!node.graf) return
  const grafArray = []
  Object.keys(node.graf).forEach(typeRelasjon => {
    const tr = { type: typeRelasjon, noder: [] }
    Object.keys(node.graf[typeRelasjon]).forEach(kode => {
      const sub = node.graf[typeRelasjon][kode]
      sub.kode = kode
      sub.url = url(kode)
      tr.noder.push(sub)
    })
    grafArray.push(tr)
  })
  node.graf = grafArray
}

function urlify(tittel, kode) {
  let s = kode.startsWith(typesystem.art.prefiks) ? tittel.la : tittel.nb
  if (!s) {
    log.error("Mangler tittel: " + kode + ": " + JSON.stringify(tittel))
    return kode
  }
  return s.replace(/[\/:\s]/g, "_")
}

function url(kode) {
  const node = tre[kode]
  if (!node.overordnet) {
    log.warn("Mangler overordnet:" + kode)
    return
  }
  node.overordnet.forEach(node => (node.url = tre[node.kode].url))
  let sti = node.overordnet.map(f => f.tittel)
  sti = sti.reverse()
  sti.push(node.tittel)
  return sti.map(e => urlify(e, kode)).join("/")
}
