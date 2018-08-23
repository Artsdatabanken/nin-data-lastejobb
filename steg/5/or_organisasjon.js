const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")

let organisasjon = io.lesKildedatafil("or_organisasjon")
let datasett = io.lesKildedatafil("or_datasett")

function lagRelasjonTilDatasett(kilde) {
  Object.keys(datasett).forEach(key => {
    const o = organisasjon[key]
    const sett = datasett[key]
    o.relasjon = sett.map(s => {
      return {
        kode: s,
        kant: "publiserert av",
        kantRetur: "publiseres av",
        erSubset: false
      }
    })
  })
}

lagRelasjonTilDatasett()

io.skrivDatafil(__filename, organisasjon)
