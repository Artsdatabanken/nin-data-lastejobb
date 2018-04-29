const io = require("../../lib/io")
const log = require("log-less-fancy")()
const config = require("../../config")
const typesystem = require("@artsdatabanken/typesystem")

const kodesystem = config.kodesystem

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

let taxons = io.lesDatafil("inn_ar_taxon")

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
  taxonId2Kode[c.taxonId] = typesystem.Art.lagKode(
    c.scientificNames[0].ScientificNameID
  )
})

function artFullSti(c) {
  if (c.higherClassification.length <= 0) return "Biota"
  let r = ""
  c.higherClassification.forEach(hc => {
    if (r) r = "/" + r
    r = typesystem.medGyldigeTegn(hc.scientificName) + r
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
    typesystem.medGyldigeTegn(c.ScientificName)
  )
}

function forelder(sn) {
  if (sn.higherClassification) {
    const ho = sn.higherClassification[0]
    return typesystem.Art.lagKode(ho.scientificNameID)
  }
  if (c.ParentTaxonId === 0) return kodesystem.prefix.taxon.replace("_", "")
  return kodesystem.rotkode
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

function toKeys(arr) {
  const r = {}
  arr.forEach(e => {
    r[e] = {}
  })
  return r
}

let koder = {}
taxons.forEach(c => {
  const sn = c.scientificNames[0]
  const kode = typesystem.Art.lagKode(sn.scientificNameID)
  const e = {
    tittel: { la: sn.scientificName },
    navnSciId: sn.scientificNameID,
    taxonId: c.taxonID,
    taxonIdParent: sn.higherClassification[0].taxonID,
    relasjon: {},
    foreldre: [forelder(sn)],
    infoUrl: "https://artsdatabanken.no/Taxon/x/" + sn.scientificNameID
  }

  if (c.PopularName) {
    e.tittel.nb = capitalizeFirstLetter(c.PopularName)
  }
  if (c.NatureAreaTypeCodes) {
    e.relasjon["lever i"] = toKeys(
      c.NatureAreaTypeCodes.map(kode => kodesystem.prefix.natursystem + kode)
    )
  }
  if (c.BlacklistCategory)
    e.relasjon["økologisk risiko"] = {
      [kodesystem.prefix.fremmedArt + c.BlacklistCategory]: {}
    }

  if (c.RedlistCategories)
    e.relasjon["risiko for å dø ut"] = toKeys(
      c.RedlistCategories.map(kode => kodesystem.prefix.truet + kode)
    )

  e.url = artFullSti(sn)
  log.debug(e)
  koder[kode] = e
})

io.skrivDatafil(__filename, koder)
