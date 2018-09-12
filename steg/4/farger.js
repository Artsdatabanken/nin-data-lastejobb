//if (!process.env.DEBUG) process.env.DEBUG = "*"
const path = require("path")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")
const farger = require("../../kildedata/farger.json")
const farger_dominant = require("../../kildedata/farger_dominant.json")
const tinycolor = require("tinycolor2")

let na = io.lesDatafil("na_mi_liste")
let r = {}

function settFarge(kode, farge) {
  r[kode] = farge
  const node = na[kode]
  if (node.foreldre) node.foreldre.forEach(kode => settFarge(kode, farge))
}

Object.keys(farger_dominant).forEach(kode => {
  const farge = tinycolor(farger_dominant[kode])
    .lighten(20)
    .toHslString()
  settFarge(kode, farge)
})

Object.keys(farger).forEach(kode => {
  r[kode] = farger[kode]
})

io.skrivDatafil(__filename, r)
