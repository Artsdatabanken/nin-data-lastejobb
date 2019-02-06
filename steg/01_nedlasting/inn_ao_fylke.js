const path = require("path")
const io = require("../../lib/io")
const http = require("../../lib/http")
const config = require("../../config")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

// Leser fylkers navn fra SSB

function mapFylker(kilde) {
  let r = {}
  kilde.classificationItems.forEach(ci => {
    // AO_18
    const kode = typesystem.administrativtOmråde.leggTilPrefiks(ci.code)
    const origName = ci.name
    ci.name = ci.name.replace("Troms Romsa", "Troms")
    ci.name = ci.name.replace("Finnmark Finnmárku", "Finnmark")
    if (origName !== ci.name) log.info("Endret navn", origName, "=>", ci.name)
    if (ci.code !== "99") {
      r[kode] = {
        tittel: { nb: ci.name },
        nivå: "fylke",
        utenRamme: true
      } //Kommunevåpen har en form som gjør at det ikke passer å croppe dem til en sirkel }
    }
  })
  return r
}

async function importFylker() {
  let fylker = await http.getJsonFromCache(
    "https://data.ssb.no/api/klass/v1/versions/916.json?language=nb",
    config.getCachePath("ssb") + "fylker.json"
  )
  return mapFylker(fylker)
}

importFylker()
  .then(r => {
    io.skrivDatafil(__filename, r)
  })
  .catch(err => {
    log.fatal(err)
  })
