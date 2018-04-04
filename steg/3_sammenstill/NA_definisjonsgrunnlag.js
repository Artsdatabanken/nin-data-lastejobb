const config = require('../../config')
const io = require('../../lib/io')

let hovedtyper = io.readJson(
  config.getDataPath('2_konvertering/NA_hovedtyper.json')
)

r = {}

Object.keys(hovedtyper).forEach(kode => {
  const hovedtype = hovedtyper[kode]
  const dg = hovedtype.definisjonsgrunnlag
  const pkkode = dg.kode
  if (!r[pkkode])
    r[pkkode] = {
      foreldre: [config.kodesystem.prefix.definisjonsgrunnlag],
      kode: kode,
      tittel: dg.tittel,
      undertittel: {
        nb: 'Definisjonsgrunnlag'
      },
      barn: []
    }

  r[pkkode].barn.push(kode)
})

io.writeJson(config.getDataPath(__filename), r)
