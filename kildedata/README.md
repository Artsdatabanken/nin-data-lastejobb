## [bbox.json](bbox.json)

Axis-aligned bounding boxes. Ytterpunkter til rektangel som omslutter de kartdataene som finnes for kartlaget.

```json
  "NA_V6": [
    31.14292256029043,
    70.45552450718783,
    28.989467613353625,
    70.19961927605274
  ]
```

### Datakilde

* https://github.com/Artsdatabanken/grunnkart-dataflyt/...(TODO)

## [farger.json](farger.json)

Én fargekode per tema. Brukes som standardfarge for kartlaget i kartet.

```json
{
  "MI_KA-E": "hsl(0, 59%, 63%)",
  "MI_KA-F": "hsl(0, 84%, 32%)"
}
```

### Datakilde

* Denne filen er originalen - vedlikeholdes her (Pull requests er velkomne)
  * [farger.json](farger.json)

## [kodetre_nivå.json](kodetre_nivå.json)

Inneholder navn på nivåene i de ulike kodetrærne.

```json
{
  "NA": [
    "Hovedtypegruppe",
    "Hovedtype",
    "Kartleggingsenhet 1:20000",
    "Kartleggingsenhet 1:5000",
    "Grunntype"
  ],
  "AO": ["Fylke", "Kommune"]
}
```

### Datakilde

* Denne filen er originalen - vedlikeholdes her (Pull requests er velkomne)
  * [kodetre_nivå.json](kodetre_nivå.json)

## [NA_grunntyper.json](NA_grunntyper.json)

Kobling mellom grunntyper (eks. _NA_T7-6_) og kartleggingsenheter (eks. _NA_T7-E-4_ (1:20000) eller _NA_T7-C-6_ (1:5000))

```json
{
  "NA_T7-E-4": ["NA_T7-6", "NA_T7-7", "NA_T7-13"],
  "NA_T7-C-6": ["NA_T7-6"]
}
```

### Datakilde

* Artsdatabanken (TODO: direktelenke)

## [NA_hovedtyper.json](NA_hovedtyper.json)

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

* Artsdatabanken (TODO: direktelenke)

## [OR_datasett.json](OR_datasett.json)

Kobling mellom dataleverandør og kartlag. Flere leverandører kan peke på samme kartlag. Leverandørene er definert i [OR_datasett.json](OR_datasett.json).

```json
{
  "OR_MDIR": ["NA"],
  "OR_KV": ["BS_8", "NA_I"],
  "OR_NGU": ["MI_KA"]
}
```

### Datakilde

* Denne filen er originalen - vedlikeholdes her (Pull requests er velkomne)
  * [kodetre_nivå.json](kodetre_nivå.json)

## [OR_datasett.json](OR_datasett.json)

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

* Denne filen er originalen - vedlikeholdes her (Pull requests er velkomne)
  * [OR_datasett.json](OR_datasett.json)

# [statistikk.json](statistikk.json)

Konfigurasjon av hva slags statistikk som skal publiseres for ulike lag.

| Nøkkel   | Beskrivelse                                                  |
| -------- | ------------------------------------------------------------ |
| funksjon | Matematisk funksjon (**sum**, **count**, **distinct_count**) |
| felt     | Feltet funksjonen skal lese fra, eksempel **areal**          |

Eksempel: Summer antall ulike arter i hvert geografisk område (AO) og areal av de ulike hovedtyper i natursystem. NA\_\*

```json
  "AO": {
    "NA": {
      "funksjon": "sum",
      "felt": "areal"
    },
    "AR": {
      "funksjon": "distinct_count",
      "felt": "kode"
    }
  }
```

### Datakilde

* Denne filen er originalen - vedlikeholdes her
  * [statistikk.json](statistikk.json)
