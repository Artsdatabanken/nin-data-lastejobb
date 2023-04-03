const { http, log } = require("@artsdatabanken/lastejobb")

http
  .downloadJson(
    "https://raw.githubusercontent.com/Artsdatabanken/maritim-grense/master/type.json",
    "maritim-grense.json"
  )
  .catch(err => {
    log.fatal(err)
  })
