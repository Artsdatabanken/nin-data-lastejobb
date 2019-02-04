const config = require("../../config")
const io = require("../../lib/io")
const typesystem = require("@artsdatabanken/typesystem")

let klg = io.lesDatafil("landskapsgradient.csv.json")

const r = {}

klg.forEach(inn => {
  r["NN-LA-" + hack(inn.kode)] = { tittel: { nb: inn.klg_navn } }
  r["NN-LA-" + hack(inn.klg_trinn_kode)] = {
    tittel: { nb: inn.trinn_navn },
    min: inn.verdier_klg_indekser,
    max: inn.verdier_klg_indekser,
    _beskrivelse: inn.beskrivelse_klg,
    intervall: {
      minTekst: inn.mintekst,
      maxTekst: inn.makstekst,
      min: inn.min,
      max: inn.maks,
      måleenhet: inn.måleenhet
    }
  }
})

function hack(kode) {
  return kode
    .replace("RE-ID-KF", "RE-ID")
    .split("_")
    .join("-")
}

io.skrivDatafil(__filename, r)
