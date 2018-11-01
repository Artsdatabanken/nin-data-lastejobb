const config = require("../../config")
const io = require("../../lib/io")
const typesystem = require("@artsdatabanken/typesystem")

let hovedtyper = io.lesDatafil("la.csv.json")
let klg = io.lesDatafil("la_klg.csv.json")

const r = {}

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
          kode: "LA-" + verdi.replace("_", "-"),
          kant: "definert av",
          kantRetur: "definerer"
        })
      }
    }
  })
  ny.pred_lnr = e.pred_lnr
  ny.naturlandskap = e.naturlandskap
  const kode = e.s_kode.substring(0, 4) + "-" + e.s_kode.substring(4)
  r[kode] = ny
})

/*
Object.keys(klg).forEach(kode => {
  const gradKoder = klg[kode]
  const relasjoner = []
  gradKoder.forEach(gradKode => {
    relasjoner.push({
      kode: gradKode,
      kant: "definert av",
      kantRetur: "definerer"
    })
  })
  r[kode].relasjon = relasjoner
})
*/
io.skrivDatafil(__filename, r)
