const { http, log } = require("lastejobb")

// Laster ned bounding bokser for koder
http
  .downloadJson("http://data.artsdatabanken.no/index.json", "filindeks.json")
  .catch(err => {
    log.fatal(err)
  })
