const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const { artskode, medGyldigeTegn } = require("../../lib/koder")

const kodesystem = config.kodesystem

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

let taxons = io.lesDatafil("inn_taxon")

let taxon2Data = {}
taxons.forEach(tx => {
  taxon2Data[tx.taxonId] = tx
})

let c2p = {}
taxons.forEach(taxon => {
  c2p[taxon.TaxonId] = taxon.ParentTaxonId
})

let taxonId2Kode = {}
taxons.forEach(c => {
  taxonId2Kode[c.taxonId] = artskode(c.scientificNames[0].ScientificNameID)
})

function artFullSti(c) {
  if (c.higherClassification.length <= 0) return "Biota"
  let r = ""
  c.higherClassification.forEach(hc => {
    if (r) r = "/" + r
    r = medGyldigeTegn(hc.scientificName) + r
  })
  if (r) r = "/" + r
  r = "Biota" + r
  return r
}

function artFullStiSub(c) {
  if (!c.ParentTaxonId) return c.ScientificName
  return (
    artFullStiSub(taxon2Data[c.ParentTaxonId]) +
    "/" +
    medGyldigeTegn(c.ScientificName)
  )
}

function forelder(sn) {
  if (sn.higherClassification) {
    const ho = sn.higherClassification[0]
    return artskode(ho.scientificNameID)
  }
  if (c.ParentTaxonId === 0) return kodesystem.prefix.taxon.replace("_", "")
  return kodesystem.rotkode
}

function alleForeldre(c) {
  let r = []
  while (c.ParentTaxonId) {
    c = taxon2Data[c.ParentTaxonId]
    r.push(artskode(c.ScientificNameId))
  }
  r.push(kodesystem.prefix.taxon.replace("_", ""))
  return r
}

let koder = {}
taxons.forEach(c => {
  const sn = c.scientificNames[0]
  const kode = artskode(sn.scientificNameID)
  const e = {
    tittel: { la: sn.scientificName },
    navnSciId: sn.scientificNameID,
    taxonId: c.taxonID,
    taxonIdParent: sn.higherClassification[0].taxonID,
    relasjon: [],
    foreldre: [forelder(sn)],
    infoUrl: "https://artsdatabanken.no/Taxon/x/" + sn.scientificNameID
  }

  if (c.PopularName) {
    e.tittel.nb = capitalizeFirstLetter(c.PopularName)
  }
  if (c.NatureAreaTypeCodes)
    e.relasjon.push(
      ...c.NatureAreaTypeCodes.map(kode => kodesystem.prefix.natursystem + kode)
    )
  if (c.BlacklistCategory)
    e.relasjon.push(kodesystem.prefix.fremmedArt + c.BlacklistCategory)
  if (c.RedlistCategories)
    e.relasjon.push(
      ...c.RedlistCategories.map(kode => kodesystem.prefix.truet + kode)
    )
  e.url = artFullSti(sn)
  log.debug(e)
  koder[kode] = e
})

io.skrivDatafil(__filename, koder)
