const { http, log } = require("lastejobb")
const config = require("../../config")

// Laster ned statistikk per kode, arealer, antall arter innenfor geometri
// { "AO_06-27-VV": { "area": 4798855, "observations": 778, "areas": 15 } },
// areal: dekket av denne koden
// observations: antall arter observert innenfor denne koden sitt areal
// areas: antall geometrier i undernivåer
http
  .downloadBinary(config.datakilde.statistikk, config.getDataPath(__filename))
  .catch(err => {
    log.fatal(err)
  })
