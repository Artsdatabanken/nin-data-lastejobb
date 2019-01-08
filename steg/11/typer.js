const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let data = io.lesDatafil("metabase_med_farger")

const prefixes = ["AO", "FA", "LA", "NA", "OR", "RL"]

prefixes.forEach(prefix => {
  skrivFil(prefix)
})

function skrivFil(prefix) {
  const dok = {}
  dok.meta = {
    tittel: data[prefix].tittel.nb,
    url: `https://maps.artsdatabanken.no/${prefix}/${prefix}.json`
  }
  Object.keys(data).forEach(kode => {
    if (kode.indexOf(prefix) === 0) dok[kode] = data[kode]
  })
  io.skrivBuildfil(prefix + "/" + prefix, dok)
}

io.skrivDatafil(__filename, data)
