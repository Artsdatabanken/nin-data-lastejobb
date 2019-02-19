const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let slettet_fordi_mangler_bbox = []
let tre = io.lesDatafil("metabase_kartformat")

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
  if (node.graf && Object.keys(node.graf).length > 0) return true
  const visAlltid = [
    //    "NA-BS-8",
    //    "NA-BS-2JM",
    //    "NA-BS-8ER",
    //    "NA-BS-8TH",
    //"NA-HT-DG",
    //"NA-HT-PK"
  ]
  if (visAlltid.includes(kode)) return true
  if (kode === typesystem.rotkode) return true
  // if (kode.indexOf("VV") === 0) return true
  // if (kode.indexOf("OR") === 0) return true
  // if (kode.indexOf("NA-HT") === 0) return true
  //  if (kode.indexOf("LA") === 0) return true
  if (kode.indexOf("RL") === 0) return true
  // if (kode.indexOf("FA") === 0) return true
  if (kode.indexOf()) return !!tre[kode].bbox

  return harBarnMedKartdata(node)
}

function harBarnMedKartdata(node) {
  if (node.kartformat) return true
  const barn = node.barn
  if (!barn) return false
  for (var key in Object.keys(barn))
    if (harBarnMedKartdata(barn[key])) return true
  return false
}
