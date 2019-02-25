const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")

const taxons = io.lesDatafil("ar_taxon_to_json")

let taxon2Data = {}
taxons.forEach(tx => {
  taxon2Data[tx.id] = tx
})

let c2p = {}
taxons.forEach(taxon => {
  c2p[taxon.id] = taxon.parentId
})

function forelder(sciNameId) {
  if (sciNameId === null) return typesystem.rotkode
  if (sciNameId) return typesystem.art.lagKode(sciNameId)
  return typesystem.art.prefiks
}

let koder = {}
taxons.forEach(c => {
  const kode = typesystem.art.lagKode(c.id)
  const e = {
    tittel: c.tittel,
    foreldre: [forelder(c.parentId)]
    //    infoUrl: `https://artsdatabanken.no/Taxon/${typesystem.art.prefiks}/${c.id}`
  }
  koder[kode] = e
})

io.skrivDatafil(__filename, koder)
