const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")

const taxons = io.lesDatafil("ar_taxon_to_json")

let taxon2Data = {}
taxons.forEach(tx => {
  taxon2Data[tx.id] = tx
})

Object.keys(taxon2Data).forEach(kode => {
  let node = taxon2Data[kode]
  if (!node.finnesINorge) return
  while (node) {
    if (kode === "AR-108610") debugger
    node.finnesINorge = true
    node = taxon2Data[node.parentId]
  }
})

let child2parent = {}
taxons.forEach(taxon => {
  child2parent[taxon.id] = taxon.parentId
})

function forelder(parentId) {
  if (parentId && parentId.indexOf("108610") >= 0) debugger
  if (!parentId) return {}
  let parent = taxon2Data[parentId]
  if (!parent) return null // finnes ikke i Norge?
  while (parent.gyldigId !== parent.id) parent = taxon2Data[parent.gyldigId]
  if (!parent) return null
  if (!parent.status === "Gyldig") return null
  return parent
}

function forelderkode(id) {
  if (!id) return typesystem.art.prefiks
  return typesystem.art.lagKode(id)
}

let koder = {}
taxons.forEach(c => {
  if (c.id.indexOf("108610") >= 0) debugger
  if (c.status !== "Gyldig") return
  if (!c.finnesINorge) return
  const kode = typesystem.art.lagKode(c.id)
  const parent = forelder(c.parentId)
  if (!parent) return // Kan være status Uavklart f.eks.
  const e = {
    tittel: c.tittel,
    foreldre: [forelderkode(parent.id)]
  }
  koder[kode] = e
})

io.skrivDatafil(__filename, koder)
