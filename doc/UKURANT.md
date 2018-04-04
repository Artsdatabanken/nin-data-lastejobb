
## Lasting av grunntyper fra "databanken"

Ble gjort med bombing av databanken med http requests.

TODO: Finn en bedre måte.


```javascript
const nin_api_graf = 'https://www.artsdatabanken.no/api/graph/NiN2.0/'
async function importerGrunntypeKoblinger(kode, mineGrunntyper) {
  const url = nin_api_graf + '/' + kode.replace('NA_', '')
  const json = await io.getJsonFromCache(
    url,
    config.getCachePath('nin_api_graf') + '/' + kode + '.json'
  )
  const klassifisering = json.Klassifisering[0].Grunntypeinndeling
  klassifisering.forEach(gtf => {
    const namespace = 'https://www.artsdatabanken.no/api/graph/NiN2.0/'
    const gt = config.prefix.natursystem + gtf.replace(namespace, '')
    if (!mineGrunntyper[kode]) mineGrunntyper[kode] = []
    mineGrunntyper[kode].push(gt)
  })
}
```
