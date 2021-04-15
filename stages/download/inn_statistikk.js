const { http, log } = require("@artsdatabanken/lastejobb")

// Laster ned statistikk per kode, arealer, antall arter innenfor geometri
// { "AO_06-27-VV": { "area": 4798855, "observations": 778, "areas": 15 } },
// areal: dekket av denne koden
// observations: antall arter observert innenfor denne koden sitt areal
// areas: antall geometrier i undernivåer
http
  .downloadBinary(
    "https://data.artsdatabanken.no/statistikk.json",
    "inn_statistikk.json"
  )
  .catch(err => {
    log.fatal(err)
  })
