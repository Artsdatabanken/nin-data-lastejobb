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
    tittel: { nb: e.name, en: e.field7 }
  }
  Object.keys(e).forEach(key => {
    if (key.startsWith("klg_")) {
      const verdi = e[key]
      if (verdi) {
        if (!ny.relasjoner) ny.relasjoner = []
        ny.relasjoner.push({
          kode: "LA-" + hack(verdi),
          kant: "definert av",
          kantRetur: "definerer"
        })
      }
    }
  })
  ny.pred_lnr = e.pred_lnr
  ny.naturlandskap = e.naturlandskap
  let kode = e.s_kode.substring(0, 4)
  if (e.s_kode.length > 4) kode += "-" + e.s_kode.substring(4)
  r[kode] = ny
})

io.skrivDatafil(__filename, r)
