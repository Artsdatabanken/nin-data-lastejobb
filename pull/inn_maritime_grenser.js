const { http, log } = require("lastejobb")

http
  .downloadJson(
    "https://raw.githubusercontent.com/Artsdatabanken/maritime-grenser/master/build/type.json",
    "data/maritim-grense.json"
  )
  .catch(err => {
    log.fatal(err)
  })
