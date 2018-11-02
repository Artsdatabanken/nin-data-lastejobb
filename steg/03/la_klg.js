const config = require("../../config")
const io = require("../../lib/io")
const typesystem = require("@artsdatabanken/typesystem")

let klg = io.lesDatafil("la_klg.csv.json")

const r = {}

klg.forEach(inn => {
  r["LA-" + hack(inn.field2)] = { tittel: { nb: inn.klg_navn } }
  r["LA-" + hack(inn.klg_trinn_kode)] = {
    tittel: { nb: inn.trinn_navn },
    min: inn.verdier_klg_indekser,
    max: inn.verdier_klg_indekser
  }
})

function hack(kode) {
  return kode
    .replace("RE-ID-KF", "RE-ID")
    .split("_")
    .join("-")
}

io.skrivDatafil(__filename, r)
