const http = require('../../lib/http')
const config = require('../../config')
const log = require('../../lib/log')

config.logLevel = 5

// Laster ned arter fra Artsdatabanken sitt API
http
  .downloadBinary2File(
    config.datakilde.AR_taxon,
    config.getDataPath(__filename)
  )
  .catch(err => {
    log.e(err)
    process.exit(99)
  })

if (false)
  http
    .downloadJson2File(
      config.datakilde.AR_taxon,
      config.getDataPath(__filename)
    )
    .catch(err => {
      log.e(err)
      process.exit(99)
    })
