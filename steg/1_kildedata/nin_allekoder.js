const { downloadJson2File } = require('../../lib/http')
const config = require('../../config')

// Laster ned NiN koder fra obsolete kodetjeneste og lagrer lokalt
// TODO: Last data fra kildedata (Øyvind sitt Excel-ark?)

// NA - Natursystem
downloadJson2File(config.datakilde.nin_koder, config.getDataPath(__filename))
