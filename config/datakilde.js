const datakilde = {
  AR_taxon_all: 'https://www.artsdatabanken.no/api/taxon/all',
  AR_taxon: 'https://www.artsdatabanken.no/api/taxon/?pageindex=1&pagesize=2',
  MI_variasjon:
    'http://webtjenester.artsdatabanken.no/NiN/v2b/variasjon/alleKoder',
  NA_diagnostisk_art: './kildedata/NA_diagnostisk_art.json',
  NA_koder: 'http://webtjenester.artsdatabanken.no/NiN/v2b/koder/alleKoder',
  NA_hovedtyper: './kildedata/NA_hovedtyper.json',
  NA_grunntyper: './kildedata/NA_grunntyper.json',
  OR_organisasjon: './kildedata/organisasjon.json',
  bbox: './kildedata/bbox.json'
}

module.exports = datakilde
