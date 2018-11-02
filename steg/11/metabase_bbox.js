const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let slettet_fordi_mangler_bbox = []
let data = io.lesDatafil("metabase_med_farger")

fjernKoderSomIkkeHarData(data)
fjernRelasjonTilKoderSomIkkeHarData(data)

log.info("Mangler bbox for " + slettet_fordi_mangler_bbox.length + " koder")
io.skrivDatafil(__filename, data)
io.skrivDatafil("mangler_data", slettet_fordi_mangler_bbox)

function fjernKoderSomIkkeHarData(data) {
  Object.keys(data).forEach(kode => {
    const node = data[kode]
    node.kode = kode
    if (!harKartData(kode)) {
      delete data[kode]
      slettet_fordi_mangler_bbox.push(kode)
    }
  })
}

function fjernRelasjonTilKoderSomIkkeHarData(data) {
  Object.keys(data).forEach(parent => {
    const node = data[parent]
    if (!node.graf) return
    Object.keys(node.graf).forEach(kode => {
      Object.keys(node.graf[kode]).forEach(relatertKode => {
        if (harKartData(relatertKode)) return
        //      log.warn(`Fjerner relasjon til node som mangler data '${relatertKode}'`)
        delete node.graf[kode][relatertKode]
      })
    })
  })
}

function harKartData(kode) {
  const visAlltid = [
    "NA-MI-AS",
    "NA-MI-BK",
    "NA-MI-DL",
    "NA-MI-DM",
    "NA-MI-ER",
    "NA-MI-FK",
    "NA-MI-GS",
    "NA-MI-HF",
    "NA-MI-HI",
    "NA-MI-HR",
    "NA-MI-HS",
    "NA-MI-HU",
    "NA-MI-IF",
    "NA-MI-IO",
    "NA-MI-JV",
    "NA-MI-KA",
    "NA-MI-KI",
    "NA-MI-KO",
    "NA-MI-KT",
    "NA-MI-KY",
    "NA-MI-LA",
    "NA-MI-LK",
    "NA-MI-MB",
    "NA-MI-MF",
    "NA-MI-MX",
    "NA-MI-NG",
    "NA-MI-OF",
    "NA-MI-OM",
    "NA-MI-OR",
    "NA-MI-PF",
    "NA-MI-RU",
    "NA-MI-S1",
    "NA-MI-S3",
    "NA-MI-SA",
    "NA-MI-SE",
    "NA-MI-SF",
    "NA-MI-SH",
    "NA-MI-SM",
    "NA-MI-SP",
    "NA-MI-SS",
    "NA-MI-SU",
    "NA-MI-SV",
    "NA-MI-SX",
    "NA-MI-SY",
    "NA-MI-TE",
    "NA-MI-TU",
    "NA-MI-TV",
    "NA-MI-UE",
    "NA-MI-UF",
    "NA-MI-VF",
    "NA-MI-VI",
    "NA-MI-VM",
    "NA-MI-VR",
    "NA-MI-VS",
    "NA-MI-VT",
    "NA-BS-8",
    "NA-BS-2JM",
    "NA-BS-8ER",
    "NA-BS-8TH",
    "NA-HT-DG",
    "NA-HT-PK"
  ]
  if (visAlltid.includes(kode)) return true
  if (kode === typesystem.rotkode) return true
  // HACK: Fjernes når kartgrunnlag ok
  if (kode.indexOf("LA") === 0) return true
  if (kode.indexOf("LG") === 0) return true
  if (kode.indexOf("AR") >= 0) return true
  if (kode.indexOf("VV") >= 0) return true
  if (kode.indexOf("OR") === 0) return true
  if (kode.indexOf("NA-HT") >= 0) return true
  if (!data[kode]) return false

  return data[kode].bbox
}
