const io = require('../../lib/io')
const http = require('../../lib/http')
const log = require('../../lib/log')
const config = require('../../config')

function parseSpråk(s) {
  switch (s) {
    case 'Gáivuotna - Kåfjord - Kaivuono':
      return 'Kåfjord'
    case 'Fauske - Fuosko':
      return 'Fauske'
    case 'Hamarøy - Hábmer':
      return 'Hamarøy'
    case 'Divtasvuodna - Tysfjord':
      return 'Tysfjord'
    case 'Sortland - Suortá':
      return 'Sortland'
    case 'Harstad - Hárstták':
      return 'Harstad'
    case 'Loabák - Lavangen':
      return 'Lavangen'
    case 'Storfjord - Omasvuotna - Omasvuono':
      return 'Storfjord'
    case 'Gáivuotna - Kåfjord - Kaivuono':
      return 'Kåfjord'
    case 'Guovdageaidnu - Kautokeino':
      return 'Kautokeino'
    case 'Porsanger - Porsángu - Porsanki':
      return 'Porsanger'
    case 'Kárášjohka - Karasjok':
      return 'Karasjok'
    case 'Deatnu - Tana':
      return 'Tana'
    case 'Unjárga - Nesseby':
      return 'Nesseby'
    case 'Snåase - Snåsa':
      return 'Snåsa'
    case 'Raarvihke - Røyrvik':
      return 'Røyrvik'
  }
  return s
}

function mapKommuner(kommuner) {
  r = {}
  kommuner.forEach(ci => {
    // AO_18-50
    const kode = config.kodesystem.prefix.administrativtOmråde + ci.code
    if (ci.code !== '9999') {
      r[kode] = {
        kode: kode,
        tittel: { nb: parseSpråk(ci.name) }
      }
    }
  })
  return r
}

async function importKommuner() {
  var dato = new Date()
  const from = dato.toISOString().substring(0, 10) // 2018-01-30
  dato.setDate(dato.getDate() + 1)
  const to = dato.toISOString().substring(0, 10) // 2018-01-31

  let kommuner = await http.getJsonFromCache(
    `http://data.ssb.no/api/klass/v1/classifications/131/codes.json?from=${from}&to=${to}`,
    config.getCachePath('ssb') + 'kommuner.json'
  )
  return mapKommuner(kommuner)
}

importKommuner()
  .then(r => {
    io.writeJson(config.getDataPath(__filename), r)
  })
  .catch(err => log.e(err))
