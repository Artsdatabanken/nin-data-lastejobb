const { downloadJson2File } = require("../../lib/http")
const config = require("../../config")
const log = require("log-less-fancy")()

// Laster ned NiN koder fra obsolete kodetjeneste og lagrer lokalt
// TODO: Last data fra kildedata (Øyvind sitt Excel-ark?)

// NA - Natursystem
// Deaktivert på grunn av ustabil tjeneste
// Datafilen lagt inn som del av repo under kildedata/na_kode.json
return
downloadJson2File(
  config.datakilde.na_koder,
  config.getDataPath(__filename)
).catch(err => {
  log.fatal(err)
})
