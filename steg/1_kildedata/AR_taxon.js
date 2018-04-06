const { downloadJson2File } = require('../../lib/http')
const config = require('../../config')

// Laster ned arter fra Artsdatabanken sitt API
if (false)
  downloadJson2File(
    config.datakilde.AR_taxon,
    config.getDataPath(__filename)
  ).catch(err => {
    process.exit(99)
  })
