const http = require("../../lib/http")
const config = require("../../config")
const log = require("log-less-fancy")()

// Laster ned NiN koder fra obsolete kodetjeneste og lagrer lokalt
// TODO: Last data fra kildedata (Øyvind sitt Excel-ark?)

//BS,MI - Beskrivelsessystem og miljøvariabler
// Deaktivert på grunn av ustabil tjeneste
// Datafilen lagt inn som del av repo under kildedata/mi_varasjon.json
/*
return http
  .downloadJson2File(
    config.datakilde.mi_variasjon,
    config.getDataPath(__filename)
  )
  .catch(err => {
    log.fatal(err)
  })
*/
