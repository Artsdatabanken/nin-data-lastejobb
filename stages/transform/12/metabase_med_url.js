const { io, url } = require("lastejobb")
const typesystem = require("@artsdatabanken/typesystem")

let tre = io.lesDatafil("metabase_tweaks")

new url(tre).assignUrls()
Object.keys(tre).forEach(kode => oppdaterNivå(tre[kode]))
io.skrivDatafil(__filename, tre)

function oppdaterNivå(node) {
  oppdaterNivå1(node)
  const undernivå = typesystem.hentNivaa(node.url + "/x")
  if (undernivå) node.undernivå = undernivå[0]
  node.overordnet.forEach(ov => {
    oppdaterNivå1(ov)
  })
}

function oppdaterNivå1(node) {
  if (node.url === "Katalog") return
  node.nivå = node.nivå || typesystem.hentNivaa(node.url)[0]
}
