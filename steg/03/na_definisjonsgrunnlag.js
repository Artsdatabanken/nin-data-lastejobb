const config = require("../../config")
const io = require("../../lib/io")
const typesystem = require("@artsdatabanken/typesystem")

let hovedtyper = io.lesDatafil(config.getDataPath("na_hovedtype"))

r = {}

Object.keys(hovedtyper).forEach(kode => {
  const hovedtype = hovedtyper[kode]
  const dg = hovedtype.definisjonsgrunnlag
  const pkkode = dg.kode
  if (!r[pkkode])
    r[pkkode] = {
      foreldre: ["NN-NA-TI-HT-DG"],
      tittel: dg.tittel,
      nivå: "definisjonsgrunnlag"
    }
})

io.skrivDatafil(__filename, r)
