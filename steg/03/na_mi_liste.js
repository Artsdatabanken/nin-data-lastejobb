if (!process.env.DEBUG) process.env.DEBUG = "*"
const path = require("path")
const typesystem = require("@artsdatabanken/typesystem")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")

// Lager liste av natursystemtyper og miljøvariabler

let ninkoder = io.lesDatafil("na_kode")
let variasjon = io.lesDatafil("mi_variasjon")
let overrides = io.lesDatafil("na_overstyr_hierarki")

const alle = Object.assign({}, ninkoder, variasjon)
let noder = {}

let fjernet = []

function skalMedISystemet(kode) {
  // if (typesystem.Natursystem.erGrunntype(kode)) return false
  // Kartleggingsenheter B og D utgår, men blir fjernet automatisk siden vi ikke har data der
  if (kode.match(/NN-NA-.*-B-/g) || kode.match(/NN-NA-.*-D-/g)) return false
  return true
}

for (let kode of Object.keys(alle))
  if (!skalMedISystemet(kode)) {
    fjernet.push(kode)
    delete alle[kode]
  }

for (let kode of Object.keys(alle)) {
  const node = alle[kode]

  var parts = kode.split("_")
  if (parts[1] & !node.infoUrl) node.infoUrl = config.infoUrl.nin + parts[1]

  if (overrides[kode]) node.foreldre = overrides[kode]
  noder[kode] = node
}

fjernet.length > 0 &&
  log.debug(
    "Koder som ble fjernet fordi det er definert at de ikke skal med: " +
      fjernet.length
  )

io.skrivDatafil(__filename, noder)
