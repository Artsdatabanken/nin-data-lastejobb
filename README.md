[![Build Status](https://travis-ci.org/Artsdatabanken/kverna.svg?branch=master)](https://travis-ci.org/Artsdatabanken/kverna)
[![Dependencies](https://david-dm.org/artsdatabanken/kverna.svg)](https://david-dm.org)
[![Greenkeeper badge](https://badges.greenkeeper.io/Artsdatabanken/kverna.svg)](https://greenkeeper.io/)
[![Open Source Love](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
[![contributions welcome](https://camo.githubusercontent.com/926d8ca67df15de5bd1abac234c0603d94f66c00/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f636f6e747269627574696f6e732d77656c636f6d652d627269676874677265656e2e7376673f7374796c653d666c6174)](https://github.com/Artsdatabanken/kverna/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md#pull-requests)

## Dokumentasjon

* [Kildedata](kildedata/README.md)
* [Eksterne datakilder](steg/1_nedlasting/README.md)
* Internt [JSON format](doc/JSON.md)
* [Ukurante løsninger (TODOs)](doc/UKURANT.md)

## Build output

* [Kodetre som lastes i API](https://adb-typesystem.surge.sh/kodetre.json) (~5MB)
* [Kodetre som lastes i PostgreSQL](https://adb-typesystem.surge.sh/kodetre_postgre.json) (~5MB)
* [Metabase for UI, lastes i Firebase](https://adb-typesystem.surge.sh/metabase.json) (~50MB)
* [Koder som mangler data](https://adb-typesystem.surge.sh/mangler_data.json) (~2MB)

## Deployment

Bygd metabase deployes automatisk til [Firebase Realtime](https://adb-kode.firebaseio.com/.json) og leses derfra av klienten.

## Relaterte prosjekter

* [Innsynsklient](https://github.com/artsdatabanken/ratatouille)
* [REST API](https://github.com/Artsdatabanken/ogapi)
* [GIS dataflyt](https://github.com/artsdatabanken/grunnkart-dataflyt)
* [Geografisk API](https://github.com/Artsdatabanken/rasterQ) og [Deployment](https://github.com/Artsdatabanken/rasterUploader) av dette
* Verktøy for [rødlisting av naturtyper](https://github.com/Artsdatabanken/natty)

## Relasjoner

Liste av relasjoner mellom typer. _erSubset_ indikerer om typen er et subset av type angitt i _kode_.

```javascript
relasjon: [
  {
    kode: "målkode",
    kant: "navn på koblingen",
    kantRetur: "navn på koblingen tilbake fra kode til denne noden",
    erSubset: true
  }
]
```

## Spørre mot JSON

```bash
jq '.katalog.or."adb"' data/metabase.json
```

```json
{
  "@": {
    "farge": "hsl(24, 100%, 50%)",
    "tittel": {
      "nb": "Artsdatabanken"
    },
    "infoUrl": "https://www.artsdatabanken.no",
    "klasse": "Organisasjon",
    "kode": "OR_ADB",
    "sti": "or/adb",
    "overordnet": [
      {
        "kode": "OR",
        "tittel": {
          "nb": "Datakilde"
        },
        "sti": "or"
      },
      {
        "kode": "~",
        "tittel": {
          "nb": "Natur i Norge"
        },
        "sti": ""
      }
    ],
    "barn": {}
  }
}
```

```
jq '.AR_43956' data/ar_taxon.json
```

```json
{
  "tittel": {
    "la": "Dactylopusia longyearbyenensis"
  },
  "navnSciId": "43956",
  "parentId": "43953",
  "foreldre": ["AR_43953"],
  "infoUrl":
    "https://artsdatabanken.no/Taxon/Dactylopusia_longyearbyenensis/43956",
  "url":
    "Animalia/Arthropoda/Crustacea/Maxillopoda/Copepoda/Harpacticoida/Thalestridae/Thalestridae/Dactylopusia_longyearbyenensis"
}
```
