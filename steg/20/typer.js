const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let data = io.lesBuildfil("metabase")

const prefixes = ["AO", "LA", "NA", "OR", "VV"]
//const prefixes = ["AR", "AO", "FA", "LA", "NA", "OR", "RL", "VV"]

prefixes.forEach(prefix => {
  log.debug(prefix)
  skrivFil(prefix)
})

function skrivFil(prefix) {
  const dok = {
    meta: {
      tittel: data[prefix].tittel.nb,
      url: `https://maps.artsdatabanken.no/${prefix}/typer.json`
    },
    data: []
  }

  Object.keys(data).forEach(kode => {
    const node = data[kode]
    if (kode.indexOf(prefix) === 0) dok.data.push(node)
  })
  io.skrivBuildfil(prefix + "/" + prefix, dok)
}