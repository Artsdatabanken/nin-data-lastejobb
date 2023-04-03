const { http, log } = require("@artsdatabanken/lastejobb")

// Laster ned bounding bokser for koder
http
  .downloadJson(
    "http://data.test.artsdatabanken.no/index.json",
    "filindeks.json"
  )
  .catch(err => {
    log.fatal(err)
  })
