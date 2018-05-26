const config = require("../../config")
const io = require("../../lib/io")
const typesystem = require("@artsdatabanken/typesystem")

let hovedtyper = io.lesDatafil("na_hovedtype")

const r = {}

Object.keys(hovedtyper).forEach(kode => {
  const hovedtype = hovedtyper[kode]
  const pk = hovedtype.prosedyrekategori
  const pkkode = pk.kode
  if (!r[pkkode])
    r[pkkode] = {
      foreldre: [typesystem.natursystem.hovedtype.prosedyrekategori.prefiks],
      tittel: pk.tittel,
      nivå: "prosedyrekategori"
    }
})

io.skrivDatafil(__filename, r)
