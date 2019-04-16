const path = require("path")
const log = require("log-less-fancy")()
const io = require("../../lib/io")
const http = require("../../lib/http")
const typesystem = require("@artsdatabanken/typesystem")
const config = require("../../config")

// Leser kommuners navn fra SSB
// TODO: Vurder å lese fra Kartverket:
// https://ws.geonorge.no/kommuneinfo/v1/#/default/get_fylkerkommuner
// Fullstendig mangel på historikk :(

function parseSpråk(s) {
  switch (s) {
    case "Gáivuotna - Kåfjord - Kaivuono":
      return "Kåfjord"
    case "Fauske - Fuosko":
      return "Fauske"
    case "Hamarøy - Hábmer":
      return "Hamarøy"
    case "Divtasvuodna - Tysfjord":
      return "Tysfjord"
    case "Sortland - Suortá":
      return "Sortland"
    case "Harstad - Hárstták":
      return "Harstad"
    case "Loabák - Lavangen":
      return "Lavangen"
    case "Storfjord - Omasvuotna - Omasvuono":
      return "Storfjord"
    case "Gáivuotna - Kåfjord - Kaivuono":
      return "Kåfjord"
    case "Guovdageaidnu - Kautokeino":
      return "Kautokeino"
    case "Porsanger - Porsángu - Porsanki":
      return "Porsanger"
    case "Kárášjohka - Karasjok":
      return "Karasjok"
    case "Deatnu - Tana":
      return "Tana"
    case "Unjárga - Nesseby":
      return "Nesseby"
    case "Snåase - Snåsa":
      return "Snåsa"
    case "Raarvihke - Røyrvik":
      return "Røyrvik"
  }
  return s
}

function mapKommuner(kommuner) {
  r = {}
  kommuner.forEach(ci => {
    // AO_18-50
    const kode = typesystem.administrativtOmråde.leggTilPrefiks(
      ci.code.substring(0, 2) + "-" + ci.code.substring(2)
    )
    if (ci.code !== "9999") {
      r[kode] = {
        tittel: { nb: parseSpråk(ci.name) },
        nivå: "kommune"
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

  const url = `http://data.ssb.no/api/klass/v1/classifications/131/codes.json?from=${from}&to=${to}`
  let kommuner = await http.getJsonFromCache(
    url,
    config.getCachePath("ssb") + "kommuner.json"
  )
  return mapKommuner(kommuner.codes)
}

importKommuner()
  .then(r => {
    io.skrivDatafil(__filename, r)
  })
  .catch(err => {
    log.fatal(err)
  })
