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
    "MI_AS",
    "MI_BK",
    "MI_DL",
    "MI_DM",
    "MI_ER",
    "MI_FK",
    "MI_GS",
    "MI_HF",
    "MI_HI",
    "MI_HR",
    "MI_HS",
    "MI_HU",
    "MI_IF",
    "MI_IO",
    "MI_JV",
    "MI_KA",
    "MI_KI",
    "MI_KO",
    "MI_KT",
    "MI_KY",
    "MI_LA",
    "MI_LK",
    "MI_MB",
    "MI_MF",
    "MI_MX",
    "MI_NG",
    "MI_OF",
    "MI_OM",
    "MI_OR",
    "MI_PF",
    "MI_RU",
    "MI_S1",
    "MI_S3",
    "MI_SA",
    "MI_SE",
    "MI_SF",
    "MI_SH",
    "MI_SM",
    "MI_SP",
    "MI_SS",
    "MI_SU",
    "MI_SV",
    "MI_SX",
    "MI_SY",
    "MI_TE",
    "MI_TU",
    "MI_TV",
    "MI_UE",
    "MI_UF",
    "MI_VF",
    "MI_VI",
    "MI_VM",
    "MI_VR",
    "MI_VS",
    "MI_VT",
    "BS_8",
    "BS_8ER",
    "BS_8TH"
  ]
  if (visAlltid.includes(kode)) return true
  if (kode === typesystem.rotkode) return true
  // HACK: Fjernes når kartgrunnlag ok
  if (kode.indexOf("LA") === 0) return true
  if (kode.indexOf("LG") === 0) return true
  if (kode.indexOf("AR") >= 0) return true
  if (kode.indexOf("VV") >= 0) return true
  if (kode.indexOf("OR") === 0) return true
  if (kode.indexOf("NA_HT") >= 0) return true
  if (!data[kode]) return false

  return data[kode].bbox
}
