const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()

let full = io.lesDatafil("full")

function tilBarn(node) {
  return {
    tittel: node.tittel
  }
}

function lagGrafkobling(kodeFra, kodeTil, kant, metadata) {
  if (!kant)
    throw new Error(
      "Mangler navn på kant i relasjon fra " + kodeFra + " til " + kodeTil
    )
  const nodeFra = full[kodeFra]
  const nodeTil = full[kodeTil]
  if (!nodeFra || !nodeTil) {
    log.warn("Mangler kode relasjon " + kodeTil + " <-> " + kodeFra)
    return
  }
  if (kodeFra === kodeTil)
    throw new Error("Relasjon til seg selv fra " + kodeTil)

  if (!nodeFra.graf) nodeFra.graf = {}
  if (!nodeFra.graf[kant]) nodeFra.graf[kant] = {}
  let kobling = Object.assign({}, metadata, tilBarn(nodeTil))
  delete kobling.kant
  delete kobling.kantRetur
  nodeFra.graf[kant][kodeTil] = kobling
  if (kodeFra == "VV_FM") {
    log.warn(kodeFra, kant, kodeTil, metadata)
    log.warn(JSON.stringify(nodeFra.graf))
  }
}

function lagGrafkoblinger(kode, node) {
  if (!node.relasjon) return
  if (kode == "AO_01-VV") log.warn(node)
  node.relasjon.forEach(e => {
    if (!e.kode) throw new Error("Mangler kode " + e.kode)
    lagGrafkobling(kode, e.kode, e.kant, e)
    lagGrafkobling(e.kode, kode, e.kantRetur, e)
  })
  delete node.relasjon
}

Object.keys(full).forEach(key => {
  lagGrafkoblinger(key, full[key])
})

io.skrivDatafil(__filename, full)
