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
      foreldre: [typesystem.natursystem.hovedtype.definisjonsgrunnlag.prefiks],
      tittel: dg.tittel,
      undertittel: {
        nb: "Definisjonsgrunnlag"
      },
      barn: []
    }

  r[pkkode].barn.push(kode)
})

io.skrivDatafil(__filename, r)
