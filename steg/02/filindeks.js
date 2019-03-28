const io = require("../../lib/io")
const config = require("../../config")
let inn_filindeks = io.lesDatafil("Natur_i_Norge/Natursystem/inn_filindeks")
const path = require("path")

// Forventer følgende katalogstruktur på tile serveren:
// /type/subtype/.../format.projeksjon.filtype
// Dvs. at rotkatalog betraktes som klasse av data, eks. gradient eller trinn
const mapfiles = lesFilindeks()
function lesFilindeks() {
  const r = {}
  Object.keys(inn_filindeks).forEach(mapfile => {
    const p = path.parse(mapfile)
    const url = p.dir
    if (!r[url]) r[url] = {}
    r[url][p.base] = inn_filindeks[mapfile]
  })
  return r
}

io.skrivDatafil(__filename, mapfiles)
