const io = require('../../lib/io')
const http = require('../../lib/http')
const config = require('../../config')
const log = require('../../lib/log')

function mapFylker(kilde) {
  r = {}
  kilde.classificationItems.forEach(ci => {
    // AO_18
    const kode = config.kodesystem.prefix.administrativtOmråde + ci.code
    const origName = ci.name

    ci.name = ci.name.replace('Troms Romsa', 'Troms')
    ci.name = ci.name.replace('Finnmark Finnmárku', 'Finnmark')
    if (origName !== ci.name) log.i('Endret navn', origName, '=>', ci.name)
    if (ci.code !== '99') {
      r[kode] = { kode: kode, tittel: { nb: ci.name }, utenRamme: true } //Kommunevåpen har en form som gjør at det ikke passer å croppe dem til en sirkel }
    }
  })
  return r
}

async function importFylker() {
  let fylker = await http.getJsonFromCache(
    'https://data.ssb.no/api/klass/v1/versions/916.json?language=nb',
    config.getCachePath('ssb') + 'fylker.json'
  )
  return mapFylker(fylker)
}

importFylker()
  .then(r => {
    io.writeJson(config.getDataPath(__filename), r)
  })
  .catch(err => {
    log.e(err)
    process.exit(99)
  })
