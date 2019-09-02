if (!process.env.DEBUG) process.env.DEBUG = "*"
const { http, log } = require("lastejobb")
const config = require("../config")
// Laster ned arter fra Artsdatabanken sitt API
http
  .downloadBinary(config.datakilde.ar_taxon, "inn_ar_taxon.csv")
  .catch(err => {
    log.fatal(err)
  })
