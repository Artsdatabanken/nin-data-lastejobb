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

function urlify(tittel, kode, old) {
  let s = kode.startsWith(typesystem.art.prefiks)
    ? tittel.la || tittel.nb
    : tittel.nb
  if (!s) {
    log.error("Mangler tittel: " + kode + ": " + JSON.stringify(tittel))
    return kode
  }

  let url = s.replace(/[\/:\s]/g, "_")
  if (old) {
    url = url.replace("_%", "prosent")
    url = url.replace("%", "_prosent")
    url = url.replace("__", "_")
  }
  return url
}

function url(kode) {
  const node = tre[kode]
  if (!node.overordnet) throw new Error("Mangler overordnet: " + kode)

  node.overordnet.forEach(node => (node.url = tre[node.kode].url))
  let sti = node.overordnet.slice(0, -1).map(f => f.tittel)
  sti = sti.reverse()
  sti.push(node.tittel)
  const oldUrl = sti.map(e => urlify(e, kode, false)).join("/")
  const newUrl = sti.map(e => urlify(e, kode)).join("/")
  if (oldUrl !== newUrl) log.info("mv ", url1, url)
  return newUrl
}
