const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")
const path = require("path")
let tre = io.lesDatafil("metabase_med_url")
let hierarki = io.lesDatafil("kodehierarki")
const filindeks = io.lesDatafil("filindeks")
const barnAv = hierarki.barn

let script = []
// Forventer følgende katalogstruktur på tile serveren:
// /type/subtype/.../format.projeksjon.filtype
// Dvs. at rotkatalog betraktes som klasse av data, eks. gradient eller trinn
finnReserverbilder()
finnBilderSomKanGjenbrukesForLandskap()
io.skrivDatafil(__filename, script)

function finnBilderSomKanGjenbrukesForLandskap() {
  const map = io.lesDatafil("landskap_bilder_som_gjenbrukes.csv.json")
  map.forEach(e => {
    const mål = tre["NN-LA-" + e.på]
    const kilde = tre[e["bruk bilde fra"].replace("LA-", "NN-LA-TI-")]
    const målbilde = bildefil(mål.url)
    if (målbilde) return
    const kildebilde = bildefil(kilde.url)
    if (!kildebilde) return
    dupliser(kilde.url, kildebilde, mål.url)
  })
}

function bildefil(url) {
  const maps = filindeks[url]
  if (!maps) return null
  if (maps["forside_408.jpg"]) return "forside_408.jpg"
  if (maps["forside_408.png"]) return "forside_408.png"
  return null
}

function finnReserverbilder() {
  Object.keys(tre).forEach(xkode => {
    if (xkode === "~") debugger
    const node = tre[xkode]
    const maps = filindeks[node.url]
    if (maps && maps["forside_408.jpg"]) return // Already have an image
    const barn = barnAv[xkode]
    if (!barn) return
    barn.sort((a, b) => a > b)
    for (let i = 0; i < barn.length; i++) {
      if (xkode === "NN-NA-TI") debugger
      const bn = tre[barn[i]]
      const burl = bn.url
      const filer = filindeks[burl]
      if (!filer) continue
      const bilde = filer["forside_408.png"] || filer["forside_408.jpg"]
      if (!bilde) return
      dupliser(burl, bilde.filename, node.url)
      break
    }
  })
}

function dupliser(kildeUrl, bildefilnavn, målUrl) {
  script.push(`cp -n ${kildeUrl}/${bildefilnavn} ${målUrl}/`)
  log.warn(`cp -n ${kildeUrl}/${bildefilnavn} ${målUrl}/`)
}
