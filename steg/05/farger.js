//if (!process.env.DEBUG) process.env.DEBUG = "*"
const path = require("path")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")
const tinycolor = require("tinycolor2")

let r = {}

function settFarger(kilde, mapper) {
  if (!mapper) throw new Error("asdf")
  Object.keys(kilde).forEach(kode => {
    let farge = mapper(kilde[kode])
    r[kode] = farge.toHexString()
  })
}

const bareFargen = node => tinycolor(node.farge)
const lighten = node => tinycolor(node).lighten(20)

settFarger(io.lesKildedatafil("farger"), bareFargen)
settFarger(io.lesDatafil("la_farger"), bareFargen)
settFarger(io.lesKildedatafil("farger_dominant"), lighten)

io.skrivBuildfil(__filename, r)
