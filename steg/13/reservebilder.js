const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")
const path = require("path")
let tre = io.lesDatafil("metabase_med_url")
let hierarki = io.lesDatafil("kodehierarki")
const mapfiles = io.lesDatafil("filindeks")
const barnAv = hierarki.barn

let script = []
// Forventer følgende katalogstruktur på tile serveren:
// /type/subtype/.../format.projeksjon.filtype
// Dvs. at rotkatalog betraktes som klasse av data, eks. gradient eller trinn
finnReserverbilder()
io.skrivDatafil(__filename, script)

function finnReserverbilder() {
  Object.keys(tre).forEach(xkode => {
    if (xkode === "~") debugger
    const node = tre[xkode]
    const maps = mapfiles[node.url]
    if (maps && maps["forside_408.jpg"]) return // Already have an image
    const barn = barnAv[xkode]
    if (!barn) return
    barn.sort((a, b) => a > b)
    for (let i = 0; i < barn.length; i++) {
      if (xkode === "NN-NA-TI") debugger
      const bn = tre[barn[i]]
      const burl = bn.url
      const filer = mapfiles[burl]
      if (!filer) continue
      const bilde = filer["forside_408.png"] || filer["forside_408.jpg"]
      if (!bilde) return
      script.push(`cp -n ${burl}/${bilde.filename} ${node.url}/`)
      log.warn(`cp -n ${burl}/${bilde.filename} ${node.url}/`)
      break
    }
  })
}
