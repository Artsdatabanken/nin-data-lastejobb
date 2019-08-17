const { io } = require("lastejobb")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let slettet_fordi_mangler_bbox = []
let tre = io.lesDatafil("metabase_kart")
let hierarki = io.lesDatafil("kodehierarki")
const barnAv = hierarki.barn

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
      slettet_fordi_mangler_bbox.push(kode)
    }
  })
}

function harKartdata(kode) {
  const node = tre[kode]
  if (!node) return false
  // Ta med alt som har relasjoner
  if (node.kart && Object.keys(node.kart).length > 0) return true
  if (node.gradient && Object.keys(node.gradient).length > 0) return true
  if (harRelasjon(node.graf)) return true
  const visAlltid = ["OR"]
  if (visAlltid.includes(kode)) return true
  if (kode === typesystem.rotkode) return true
  if (kode.indexOf("AO-MG") === 0) return true
  if (kode.indexOf("RL") === 0) return true
  if (kode.indexOf("VV") === 0) return true
  if (kode.indexOf("NN-NA-BS-8") === 0) return true

  return harBarnMedKartdata(node)
}

function harRelasjon(graf) {
  if (!graf) return false
  if (Object.keys(graf).length !== 1) return true
  return graf[0].type !== "Datakilde"
}

function harBarnMedKartdata(node) {
  if (node.kart) return true
  const barn = barnAv[node.kode]
  if (!barn) return false
  for (const kode of barn) if (harKartdata(kode)) return true
  return false
}
