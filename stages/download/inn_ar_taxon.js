const { http, log } = require("lastejobb")
// Laster ned arter fra Artsdatabanken sitt API
http
  .downloadBinary(
    "http://eksport.artsdatabanken.no/artsnavnebase/Artsnavnebase.csv",
    "inn_ar_taxon.csv"
  )
  .catch(err => {
    log.fatal(err)
  })
