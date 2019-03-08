const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")

let organisasjon = io.lesKildedatafil("Datakilde/organisasjon")
let datasett = io.lesKildedatafil("Datakilde/datasett")

function lagRelasjonTilDatasett(kilde) {
  Object.keys(datasett).forEach(key => {
    const o = organisasjon[key]
    const sett = datasett[key]
    o.relasjon = sett.map(s => {
      return {
        kode: s,
        kant: "Datasett",
        kantRetur: "Datakilde",
        kantReturFraAlleBarna: true,
        erSubset: true
      }
    })
  })
}

lagRelasjonTilDatasett()

io.skrivDatafil(__filename, organisasjon)
