## [nin_program.json](nin_program.json)

Natur i Norge kartleggingsprogrammer og prosjekter.

```json
  {
    "beskrivelse": "Skogkartlegging 2016",
    "navn": "SKOG_2016_NORGE_1",
    "prosjekter": [
      {
        "beskrivelse": "Skogkartlegging, Kvernbekken (SKOG_MFU_MR_KVERNBEKKEN_1, Møre Og Romsdal, Miljøfaglig Utredning)",
        "navn": "SKOG_MFU_MR_KVERNBEKKEN_1"
      },
```

### Datakilde

- Denne filen er inntil videre originalen inntil Miljødirektoratet publiserer

### Datakilde

- https://github.com/Artsdatabanken/grunnkart-dataflyt/...(TODO)

## [na_grunntyper.json](na_grunntyper.json)

Kobling mellom grunntyper (eks. _NA_T7-6_) og kartleggingsenheter (eks. _NA_T7-E-4_ (1:20000) eller _NA_T7-C-6_ (1:5000))

```json
{
  "NA_T7-E-4": ["NA_T7-6", "NA_T7-7", "NA_T7-13"],
  "NA_T7-C-6": ["NA_T7-6"]
}
```

## [na_hovedtyper.json](na_hovedtyper.json)

Beskrivelse av NiN hovedtyper, hvilke LKMer er de bygget opp av og kunnskap.

```json
  {
    "Kunnskapsgrunnlag - Grunntypeinndelingen": "4",
    "HTK": "T7",
    "Navn": "Snøleie",
    "PrK": "3",
    "PrK-tekst": "Preget av miljøstress",
    "GrL": "S",
    "Definisjonsgrunnlag-tekst": "miljøstressbetinget",
    "NiN[1] ": "T30 pp.",
    "dLKM": "SV ",
    "hLKM": "KA,SV ",
    "tLKM": "KI ",
    "uLKM": "VM,HI,S1",
    "Kunnskapsgrunnlag - Hovedtypen generelt": "4"
  },
```

### Datakilde

- Artsdatabanken (TODO: direktelenke)

## [or_datasett.json](or_datasett.json)

Kobling mellom dataleverandør og kartlag. Flere leverandører kan peke på samme kartlag. Leverandørene er definert i [OR_datasett.json](OR_datasett.json).

```json
{
  "OR_MDIR": ["NA"],
  "OR_KV": ["BS_8", "NA_I"],
  "OR_NGU": ["MI_KA"]
}
```

### Datakilde

- Denne filen er originalen - vedlikeholdes her (Pull requests er velkomne)
  - [kodetre_nivå.json](kodetre_nivå.json)

## [or_datasett.json](or_datasett.json)

Beskrivelse av dataleverandører.

| Nøkkel  | Beskrivelse                                  | Datatype              |
| ------- | -------------------------------------------- | --------------------- |
| kode    | Unik kode                                    | kode med prefiks OR\_ |
| farge   | Den dominante fargen i leverandøren sin logo | css fargekode         |
| tittel  | Navnet på dataleverandør                     | streng                |
| infoUrl | Leverandørens nettsted                       | url                   |

```json
  "OR_MDIR": {
    "kode": "OR_MDIR",
    "farge": "hsl(177, 93%, 24%)",
    "tittel": { "nb": "Miljødirektoratet" },
    "infoUrl": "https://www.miljodirektoratet.no"
  }
```

### Datakilde

- Denne filen er originalen - vedlikeholdes her (Pull requests er velkomne)
  - [or_datasett.json](or_datasett.json)
