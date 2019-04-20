const log = require("log-less-fancy")()
const io = require("../../lib/io")

// Oversetter kommunedata fra https://github.com/Artsdatabanken/kommune-data

const kommuneNummerTilKode = knr =>
  "AO-" + knr.substring(0, 2) + "-" + knr.substring(2, 4)

let inn_kommune = io.readJson("./kommune-data/kommune.json").items

const r = {}
Object.entries(inn_kommune).forEach(([knr, item]) => {
  const kode = kommuneNummerTilKode(knr)
  item.tittel = { nb: item.itemLabel.replace(" kommune", "") }
  item.nivå = "kommune"
  item.naboer = item.naboer.map(nabo => kommuneNummerTilKode(nabo))
  moveKey(item, "url", "lenke.offisiell")
  moveKey(item, "article", "lenke.wikipedia")
  moveKey(item, "item", "lenke.wikidata")
  moveKey(item, "url", "lenke.offisiell")
  moveKey(item, "url", "lenke.offisiell")
  moveKey(item, "image", "bildekilde.image")
  moveKey(item, "banner", "bildekilde.banner")
  moveKey(item, "coa", "bildekilde.coa")
  r[kode] = item
})

function moveKey(o, src, destPath) {
  if (!o[src]) return
  let node = o
  const destArr = destPath.split(".")
  while (destArr.length > 1) {
    const dest = destArr.shift()
    if (!node[dest]) node[dest] = {}
    node = node[dest]
  }

  const dest = destArr.pop()
  node[dest] = o[src]
  delete o[src]
}

io.skrivDatafil(__filename, r)
