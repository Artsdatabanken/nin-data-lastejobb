if (!process.env.DEBUG) process.env.DEBUG = "*"
const path = require("path")
const koder = require("../../lib/koder")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")

let ninkoder = io.lesDatafil("NA_kode")
let variasjon = io.lesDatafil("MI_variasjon")
let overrides = io.lesDatafil("NA_overstyr_hierarki")

const alle = Object.assign({}, ninkoder, variasjon)
let noder = {}

let fjernet = []

function skalMedISystemet(kode) {
  // Grunntyper utgår.. for no
  if (koder.erGrunntype(kode)) return false
  // Kartleggingsenheter B og D utgår
  if (kode.match(/NA_.*-B-/g) || kode.match(/NA_.*-D-/g)) return false
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
  node.infoUrl = config.infoUrl.nin + parts[1]

  if (overrides[kode]) node.foreldre = overrides[kode]
  noder[kode] = node
}

log.debug(
  "Koder som ble fjernet fordi det er definert at de ikke skal med: " +
    fjernet.length
)

io.skrivDatafil(__filename, noder)
