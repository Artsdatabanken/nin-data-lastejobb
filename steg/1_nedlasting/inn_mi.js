const http = require("../../lib/http")
const config = require("../../config")
const log = require("log-less-fancy")()

// Laster ned NiN koder fra obsolete kodetjeneste og lagrer lokalt
// TODO: Last data fra kildedata (Øyvind sitt Excel-ark?)

//BS,MI - Beskrivelsessystem og miljøvariabler
http
  .downloadJson2File(
    config.datakilde.mi_variasjon,
    config.getDataPath(__filename)
  )
  .catch(err => {
    log.fatal(err)
  })
