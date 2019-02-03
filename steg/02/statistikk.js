/*const log = require("log-less-fancy")()
const config = require("../../config")
const io = require("../../lib/io")
const typesystem = require("@artsdatabanken/typesystem")

// inn:
// { "AO_06-27-VV": { "area": 4798855, "observations": 778, "areas": 15 } },
// ut:
// "AO_06-27-VV": { "areal": 4798855, "arter": 778, "geometrier": 15 },

let stats = io.lesDatafil("inn_statistikk")
const r = {}

const map = { MI: "NN-", AO: "", NA: "NN-", BS: "NN-", VV: "" }
stats.forEach(s => {
  const skode = Object.keys(s)[0]
  let kode = skode.replace("_", "-")
  const prefix = kode.substring(0, 2)
  if (!(prefix in map)) log.warn(kode)
  kode = map[prefix] + kode
  kode = kode.replace("NN-MI", "NN-LKM")
  const sn = s[skode]
  r[kode] = {
    stats: {
      areal: sn.area,
      geometrier: sn.areas,
      arter: sn.observedSpecies
    }
  }
})

io.skrivDatafil(__filename, r)
*/
