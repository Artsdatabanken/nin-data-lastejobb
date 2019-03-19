const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")
const path = require("path")
let tre = io.lesDatafil("metabase_med_url")
let hierarki = io.lesDatafil("kodehierarki")
const barnAv = hierarki.barn

let script = []
// Forventer følgende katalogstruktur på tile serveren:
// /type/subtype/.../format.projeksjon.filtype
// Dvs. at rotkatalog betraktes som klasse av data, eks. gradient eller trinn
const mapfiles = readMbtiles()
finnReserverbilder()
io.skrivDatafil(__filename, script)

function readMbtiles() {
  let mbtiles = io.lesDatafil("inn_mbtiles")
  const r = {}
  Object.keys(mbtiles).forEach(mapfile => {
    const p = path.parse(mapfile)
    if (p.base !== "forside_408.jpg") return
    const url = p.dir
    if (!r[url]) r[url] = []
    r[url].push(mbtiles[mapfile])
  })
  return r
}

function finnReserverbilder() {
  Object.keys(tre).forEach(xkode => {
    const node = tre[xkode]
    const maps = mapfiles[node.url]
    if (maps) return
    const barn = barnAv[xkode]
    if (!barn) return
    barn.sort((a, b) => a > b)
    for (let i = 0; i < barn.length; i++) {
      const bn = tre[barn[i]]
      const burl = bn.url
      if (!mapfiles[burl]) continue
      script.push(`cp -n ${burl}/forside_408.jpg ${node.url}/`)
      break
    }
  })
}
