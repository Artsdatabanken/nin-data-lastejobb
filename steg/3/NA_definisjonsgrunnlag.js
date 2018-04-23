const config = require("../../config")
const io = require("../../lib/io")

let hovedtyper = io.lesDatafil(config.getDataPath("NA_hovedtype"))

r = {}

Object.keys(hovedtyper).forEach(kode => {
  const hovedtype = hovedtyper[kode]
  const dg = hovedtype.definisjonsgrunnlag
  const pkkode = dg.kode
  if (!r[pkkode])
    r[pkkode] = {
      foreldre: [config.kodesystem.prefix.definisjonsgrunnlag],
      tittel: dg.tittel,
      undertittel: {
        nb: "Definisjonsgrunnlag"
      },
      barn: []
    }

  r[pkkode].barn.push(kode)
})

io.skrivDatafil(__filename, r)
