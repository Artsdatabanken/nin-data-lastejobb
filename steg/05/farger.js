//if (!process.env.DEBUG) process.env.DEBUG = "*"
const path = require("path")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")
const tinycolor = require("tinycolor2")

let r = {}

function settFarger(kilde, mapper) {
  Object.keys(kilde).forEach(kode => {
    let farge = kilde[kode]
    if (mapper) farge = mapper(farge)
    r[kode] = { farge: farge }
  })
}

const lighten20 = farge =>
  tinycolor(farge)
    .lighten(20)
    .toHslString()

settFarger(io.lesKildedatafil("farger"))
settFarger(io.lesDatafil("la_farger"))
settFarger(io.lesKildedatafil("farger_dominant", lighten20))

io.skrivBuildfil(__filename, r)
