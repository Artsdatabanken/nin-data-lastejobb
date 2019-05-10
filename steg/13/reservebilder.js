const { io } = require("lastejobb")
const log = require("log-less-fancy")()
let tre = io.lesDatafil("metabase_med_url")
let hierarki = io.lesDatafil("kodehierarki")
const filindeks = io.lesDatafil("filindeks")
const barnAv = hierarki.barn

let script = []
// Forventer følgende katalogstruktur på tile serveren:
// /type/subtype/.../format.projeksjon.filtype
// Dvs. at rotkatalog betraktes som klasse av data, eks. gradient eller trinn
finnReserverbilder("forside_408")
finnReserverbilder("forside_950")
finnBilderSomKanGjenbrukesForLandskap("forside_408")
finnBilderSomKanGjenbrukesForLandskap("forside_950")
io.skrivDatafil(__filename, script)

function finnBilderSomKanGjenbrukesForLandskap(basename) {
  const map = io.lesDatafil("landskap_bilder_som_gjenbrukes.csv.json")
  map.forEach(e => {
    const mål = tre["NN-LA-" + e.på]
    const kilde = tre[e["bruk bilde fra"].replace("LA-", "NN-LA-TI-")]
    const målbilde = bildefil(mål.url, basename)
    if (målbilde) return
    const kildebilde = bildefil(kilde.url, basename)
    if (!kildebilde) return
    dupliser(kilde.url, kildebilde, mål.url)
  })
}

function bildefil(url, basename) {
  const maps = filindeks[url]
  if (!maps) return null
  if (maps[basename + ".jpg"]) return basename + ".jpg"
  if (maps[basename + ".png"]) return basename + ".png"
  return null
}

function finnReserverbilder(basename) {
  Object.keys(tre).forEach(xkode => {
    const node = tre[xkode]
    const maps = filindeks[node.url]
    if (maps && maps[basename + ".jpg"]) return // Already have an image
    if (maps && maps[basename + ".png"]) return // Already have an image
    const barn = barnAv[xkode]
    if (!barn) return
    barn.sort((a, b) => a > b)
    for (let i = 0; i < barn.length; i++) {
      const bn = tre[barn[i]]
      const burl = bn.url
      const filer = filindeks[burl]
      if (!filer) continue
      const bilde = filer[basename + ".png"] || filer[basename + ".jpg"]
      if (!bilde) return
      dupliser(burl, bilde.filename, node.url)
      break
    }
  })
}

function dupliser(kildeUrl, bildefilnavn, målUrl) {
  if (målUrl.indexOf("Buskerud") >= 0) debugger
  script.push(`cp -n ${kildeUrl}/${bildefilnavn} ${målUrl}/`)
  log.warn(`cp -n ${kildeUrl}/${bildefilnavn} ${målUrl}/`)
}
