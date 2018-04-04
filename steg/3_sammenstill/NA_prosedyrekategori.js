const config = require('../../config')
const io = require('../../lib/io')

let hovedtyper = io.readJson(
  config.getDataPath('2_konvertering/NA_hovedtyper.json')
)

r = {}

Object.keys(hovedtyper).forEach(kode => {
  const hovedtype = hovedtyper[kode]
  const pk = hovedtype.prosedyrekategori
  const pkkode = pk.kode
  if (!r[pkkode])
    r[pkkode] = {
      foreldre: [config.kodesystem.prefix.prosedyrekategori],
      kode: kode,
      tittel: pk.tittel,
      undertittel: {
        nb: 'Prosedyrekategori'
      },
      barn: []
    }

  r[pkkode].barn.push(kode)
})

io.writeJson(config.getDataPath(__filename), r)
