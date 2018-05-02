const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")

const kodesystem = config.kodesystem

const taxons = io.lesDatafil("ar_taxon_to_json")

let taxon2Data = {}
taxons.forEach(tx => {
  taxon2Data[tx.id] = tx
})

let c2p = {}
taxons.forEach(taxon => {
  c2p[taxon.id] = taxon.parentId
})

function artFullSti(sciNameId) {
  if (sciNameId === null) return "Biota"
  let r = ""
  sciNameId.higherClassification.forEach(hc => {
    if (r) r = "/" + r
    r = typesystem.medGyldigeTegn(hc.scientificName) + r
  })
  if (r) r = "/" + r
  r = "Biota" + r
  return r
}

function artFullStiSub(id) {
  const me = taxon2Data[id]
  if (!me.parentId) return c.tittel.la
  return (
    artFullStiSub(me.parentId) + "/" + typesystem.medGyldigeTegn(me.tittel.la)
  )
}

function forelder(sciNameId) {
  if (sciNameId === null) return kodesystem.rotkode
  if (sciNameId) return typesystem.Art.lagKode(sciNameId)
  return kodesystem.prefix.taxon.replace("_", "")
}

function alleForeldre(c) {
  let r = []
  while (c.ParentTaxonId) {
    c = taxon2Data[c.ParentTaxonId]
    r.push(typesystem.Art.lagKode(c.ScientificNameId))
  }
  r.push(kodesystem.prefix.taxon.replace("_", ""))
  return r
}

let koder = {}
taxons.forEach(c => {
  console.log(c)
  const kode = typesystem.Art.lagKode(c.id)
  const e = {
    tittel: c.tittel,
    navnSciId: c.id,
    parentId: c.parentId,
    foreldre: [forelder()],
    infoUrl: `https://artsdatabanken.no/Taxon/${typesystem.medGyldigeTegn(
      c.tittel.la
    )}/${c.id}`,
    url: artFullSti(id)
  }

  log.debug(e)
  koder[kode] = e
})

io.skrivDatafil(__filename, koder)
