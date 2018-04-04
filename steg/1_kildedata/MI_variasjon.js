const { downloadJson2File } = require('../../lib/http')
const config = require('../../config')

// Laster ned NiN koder fra obsolete kodetjeneste og lagrer lokalt
// TODO: Last data fra kildedata (Øyvind sitt Excel-ark?)

//BS,MI - Beskrivelsessystem og miljøvariabler
downloadJson2File(config.datakilde.MI_variasjon, config.getDataPath(__filename))
