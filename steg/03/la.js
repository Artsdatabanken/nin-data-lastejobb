const config = require("../../config")
const io = require("../../lib/io")
const typesystem = require("@artsdatabanken/typesystem")

let hovedtyper = io.lesDatafil("la.csv.json")

const r = {}

function hack(kode) {
  return kode
    .replace("RE-ID-KF", "RE-ID")
    .split("_")
    .join("-")
}

hovedtyper.forEach(e => {
  const ny = {
    tittel: { nb: e.name, en: e.field7 },
    relasjon: []
  }
  Object.keys(e).forEach(key => {
    if (key.startsWith("klg_")) {
      const verdi = e[key]
      if (verdi) {
        ny.relasjon.push({
          kode: "NN-LA-" + hack(verdi),
          kant: "definert av",
          kantRetur: "definerer",
          erSubset: true
        })
      }
    }
  })
  ny.pred_lnr = e.pred_lnr
  const menneskeligPåvirkning =
    e.naturlandskap === 1 ? "NN-LA-MP-NL" : "NN-LA-MP-KL"
  ny.relasjon.push({
    kode: menneskeligPåvirkning,
    kant: "menneskelig påvirkning",
    kantRetur: "består av",
    erSubset: true
  })
  let kode = e.s_kode.substring(0, 4)
  if (e.s_kode.length > 4) kode += "-" + e.s_kode.substring(4)
  r["NN-" + kode] = ny
})

io.skrivDatafil(__filename, r)
