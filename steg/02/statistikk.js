const config = require("../../config")
const io = require("../../lib/io")
const typesystem = require("@artsdatabanken/typesystem")

// inn:
// { "AO_06-27-VV": { "area": 4798855, "observations": 778, "areas": 15 } },
// ut:
// "AO_06-27-VV": { "areal": 4798855, "arter": 778, "geometrier": 15 },

let stats = io.lesDatafil("inn_statistikk")
const r = {}

stats.forEach(s => {
  const kode = Object.keys(s)[0]
  const sn = s[kode]
  r[kode] = {
    stats: {
      areal: sn.area,
      geometrier: sn.areas,
      arter: sn.observations
    }
  }
})

// Akkumulerte data
Object.keys(r).forEach(kode => {
  const stats = r[kode].stats
  const prefix = typesystem.splittKode(kode)[0]
  const toppnode = r[prefix].stats
  if (prefix) {
    stats.arealPrefix = toppnode.areal
    stats.arterPrefix = toppnode.arter
    stats.geometrierPrefix = toppnode.geometrier
  }
})

io.skrivDatafil(__filename, r)
