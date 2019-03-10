const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let slettet_fordi_mangler_bbox = []
let tre = io.lesDatafil("metabase_kart")

fjernKoderSomIkkeHarData(tre)
//fjernRelasjonTilKoderSomIkkeHarData(tre)

log.info("Mangler bbox for " + slettet_fordi_mangler_bbox.length + " koder")
io.skrivDatafil(__filename, tre)
io.skrivDatafil("mangler_data", slettet_fordi_mangler_bbox)

function fjernKoderSomIkkeHarData(data) {
  Object.keys(data).forEach(kode => {
    const node = data[kode]
    node.kode = kode
    if (!harKartdata(kode)) {
      delete data[kode]
      const forelderKode = node.overordnet[0].kode
      const forelderNode = data[forelderKode]
      if (forelderNode) {
        // Kan allerede være slettet
        delete forelderNode.barn[kode]
      }
      slettet_fordi_mangler_bbox.push(kode)
    }
  })
}

function fjernRelasjonTilKoderSomIkkeHarData(data) {
  Object.keys(data).forEach(parent => {
    const node = data[parent]
    if (!node.graf) return
    Object.keys(node.graf).forEach(kode => {
      node.graf.forEach(relasjon => {
        relasjon.noder.filter(node => harKartdata(node.kode))
      })
    })
  })
}

function harKartdata(kode) {
  const node = tre[kode]
  if (!node) return false
  // Ta med alt som har relasjoner
  if (node.gradient && Object.keys(node.gradient).length > 0) return true
  if (harRelasjon(node.graf)) return true
  const visAlltid = ["OR"]
  if (visAlltid.includes(kode)) return true
  if (kode === typesystem.rotkode) return true
  if (kode.indexOf("RL") === 0) return true

  return harBarnMedKartdata(node)
}

function harRelasjon(graf) {
  if (!graf) return false
  if (Object.keys(graf).length !== 1) return true
  return graf[0].type !== "Datakilde"
}

function harBarnMedKartdata(node) {
  if (node.kart) return true
  const barn = node.barn
  if (!barn) return false
  for (const kode of Object.keys(barn)) if (harKartdata(kode)) return true
  return false
}
