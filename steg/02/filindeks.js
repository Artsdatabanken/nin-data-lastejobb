const { io } = require("lastejobb")
let inn_filindeks = io.lesDatafil("filindeks.json")
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
