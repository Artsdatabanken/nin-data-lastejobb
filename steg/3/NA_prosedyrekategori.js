const config = require("../../config")
const io = require("../../lib/io")

let hovedtyper = io.lesDatafil("NA_hovedtype")

const r = {}

Object.keys(hovedtyper).forEach(kode => {
  const hovedtype = hovedtyper[kode]
  const pk = hovedtype.prosedyrekategori
  const pkkode = pk.kode
  if (!r[pkkode])
    r[pkkode] = {
      foreldre: [config.kodesystem.prefix.prosedyrekategori],
      tittel: pk.tittel,
      undertittel: {
        nb: "Prosedyrekategori"
      },
      barn: []
    }

  r[pkkode].barn.push(kode)
})

io.skrivDatafil(__filename, r)
