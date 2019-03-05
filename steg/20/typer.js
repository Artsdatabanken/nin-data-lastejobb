const config = require("../../config")
const io = require("../../lib/io")
const log = require("log-less-fancy")()
const typesystem = require("@artsdatabanken/typesystem")

let data = io.lesBuildfil("metabase")

const prefixes = ["AO", "AR", "NN-LA", "NN-NA", "OR", "VV"]

prefixes.forEach(prefix => {
  skrivFil(prefix)
})

function skrivFil(prefix) {
  if (!data[prefix]) throw new Error("Unknown prefix " + prefix)
  const titler = data[prefix].tittel
  tittel = titler.la || titler.nb
  const dok = {
    meta: {
      tittel: tittel,
      url: `https://data.artsdatabanken.no/${tittel}/metadata_med_undertyper.json`
    },
    data: []
  }

  Object.keys(data).forEach(kode => {
    const node = data[kode]
    if (kode.indexOf(prefix) === 0) dok.data.push(node)
  })
  io.skrivBuildfil(prefix + "/" + prefix, dok)
}
