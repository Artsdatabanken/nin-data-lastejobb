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
    r[kode] = farge
  })
}

const lighten20 = farge =>
  tinycolor(farge)
    .lighten(20)
    .toHslString()

const bareFargen = node => node.farge

settFarger(io.lesKildedatafil("farger"), bareFargen)
settFarger(io.lesDatafil("la_farger"), bareFargen)
settFarger(io.lesKildedatafil("farger_dominant", lighten20))

io.skrivBuildfil(__filename, r)
