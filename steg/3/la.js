const config = require("../../config")
const io = require("../../lib/io")
const typesystem = require("@artsdatabanken/typesystem")

let hovedtyper = io.lesDatafil("la_to_json")

const r = {}

hovedtyper.forEach(e => {
  r[e.kode] = {
    tittel: { nb: e.tittel }
  }
})

io.skrivDatafil(__filename, r)
