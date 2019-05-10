const { io } = require("lastejobb")

// Leser prosedyrekategori for natursystem hovedtyper

let hovedtyper = io.lesDatafil("na_hovedtype")

const r = {}

Object.keys(hovedtyper).forEach(kode => {
  const hovedtype = hovedtyper[kode]
  const pk = hovedtype.prosedyrekategori
  const pkkode = pk.kode.toUpperCase()
  if (!r[pkkode])
    r[pkkode] = {
      foreldre: ["NN-NA-LKM-PRK"],
      tittel: pk.tittel,
      nivå: "prosedyrekategori"
    }
})

io.skrivDatafil(__filename, r)
