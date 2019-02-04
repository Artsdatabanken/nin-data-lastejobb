const datakilde = {
  ar_taxon: "http://eksport.artsdatabanken.no/artsnavnebase/Artsnavnebase.csv",
  mi_variasjon:
    "Natur_i_Norge/Natursystem/Lokale_komplekse_miljøvariabler/mi_variasjon", // "https://webtjenester.artsdatabanken.no/NiN/v2b/variasjon/alleKoder",
  na_diagnostisk_art: "Natur_i_Norge/Natursystem/na_diagnostisk_art",
  na_koder: "Natur_i_Norge/Natursystem/na_koder", // "https://webtjenester.artsdatabanken.no/NiN/v2b/koder/alleKoder",
  na_hovedtyper: "Natur_i_Norge/Natursystem/na_hovedtyper",
  na_grunntyper: "Natur_i_Norge/Natursystem/na_grunntyper",
  or_organisasjon: "Datakilde/or_organisasjon",
  vv_verneområe:
    "http://trdefme02.miljodirektoratet.no/nedlasting/Naturbase/Shape/naturvern_utm33.zip",
  // https://kartkatalog.geonorge.no/metadata/kartverket/statistiske-inndelinger-lau/f7be9f83-e5e0-4914-8076-e37424221930
  ao_kommune_geom: "https://www.dropbox.com/s/cyi68l9mixg7bq7/LAU2018.zip?dl=1",
  kommuner:
    "https://nedlasting.geonorge.no/geonorge/Basisdata/Kommuner/GeoJSON/Basisdata_0000_Norge_25833_Kommuner_GEOJSON.zip",
  statistikk: "https://maps.artsdatabanken.no/statistikk.json",
  mbtiles: "http://maps.artsdatabanken.no/index.json"
}

module.exports = datakilde
