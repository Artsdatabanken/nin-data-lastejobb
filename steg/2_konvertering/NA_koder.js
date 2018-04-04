const io = require('../../lib/io')
const config = require('../../config')
const { erKartleggingsnivå } = require('../../lib/koder')
const { capitalizeTittel } = require('../../lib/koder')

let alleKoder = io.readJson(config.getDataPath('1_kildedata/NA_allekoder.json'))

function kodefix(kode) {
  if (!kode) return kode
  return kode.toUpperCase().replace(' ', '_')
}

function importerKoder() {
  const mineKoder = {}
  for (let node of alleKoder) {
    const kode = kodefix(node.Kode.Id)
    const forelder = kodefix(node.OverordnetKode.Id || null)
    const tittel = { nb: capitalizeTittel(node.Navn) }
    let o = { tittel: tittel }
    o.foreldre = forelder ? [forelder] : [config.rotkode]
    mineKoder[kode] = o
  }
  return mineKoder
}

const koder = importerKoder()
io.writeJson(config.getDataPath(__filename), koder)
