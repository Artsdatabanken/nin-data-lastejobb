const { config, log, wfs, http, io } = require("@artsdatabanken/lastejobb");
const fs = require("fs");
const path = require("path");

// Laster ned statistikk per kode, arealer, antall arter innenfor geometri
// { "AO_06-27-VV": { "area": 4798855, "observations": 778, "areas": 15 } },
// areal: dekket av denne koden
// observations: antall arter observert innenfor denne koden sitt areal
// areas: antall geometrier i undernivåer
// log.info(config.getTempPath("wfs_kartleggingsenhet_20k.json"));

// where=1=1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=geojson
// where=1=1&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&returnGeometry=true&returnTrueCurves=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&returnExtentOnly=false&featureEncoding=esriDefault&f=geojson

// mirrorWithSrs(
//   "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/${layer}/",
//   0, 12,
//   [4326, 25833],
//   "query?where=1=1&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&returnGeometry=true&returnTrueCurves=true&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&returnExtentOnly=false&featureEncoding=esriDefault&f=geojson&resultRecordCount=${resultRecordCount}&resultOffset=${resultOffset}",
//   "${featureId}?f=pjson",
//   "temp/wfs_kartleggingsenhet_20k.${srs}.json",
//   "temp/wfs_kartleggingsenhet_20k.${srs}.tmp.json"
//   // , { batchSize: 1000 }
// )
// .catch(err => log.fatal(err))
// .then(() => {
//   log.info(config.getTempPath("wfs_kartleggingsenhet_5k.25833.json"));
//   mirrorWithSrs(
//     "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/${layer}/",
//     1, 11,
//     [4326, 25833],
//     "query?where=1=1&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&returnGeometry=true&returnTrueCurves=true&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&returnExtentOnly=false&featureEncoding=esriDefault&f=geojson&resultRecordCount=${resultRecordCount}&resultOffset=${resultOffset}",
//     "${featureId}?f=pjson",
//     "temp/wfs_kartleggingsenhet_5k.${srs}.json",
//     "temp/wfs_kartleggingsenhet_5k.${srs}.tmp.json"
//     // , { batchSize: 1000 }
//   )
//   .catch(err => log.fatal(err));
// });

// set NODE_OPTIONS=--max_old_space_size=8192


function pad(
  a, // the number to convert 
  b // number of resulting characters
){
  return (
    1e15 + a + // combine with large number
    "" // convert to string
  ).slice(-b) // cut leading "1"
}

if (false) {
mirrorJson(
  "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/${layer}/",
  0,
  "query?where=1=1&f=pjson&returnCountOnly=false&resultRecordCount=${resultRecordCount}&resultOffset=${resultOffset}",
  "${featureId}?f=pjson",
  "Kartleggingsenhet20kid",
  "temp/kartleggingsenhet"
)
.catch(err => log.fatal(err));
mirrorJson(
  "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/${layer}/",
  12,
  "query?where=1=1&f=pjson&returnCountOnly=false&resultRecordCount=${resultRecordCount}&resultOffset=${resultOffset}",
  "${featureId}?f=pjson",
  "Kartleggingsenhet20kid",
  "temp/kartleggingsenhet"
)
.catch(err => log.fatal(err));
mirrorJson(
  "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/${layer}/",
  1,
  "query?where=1=1&f=pjson&returnCountOnly=false&resultRecordCount=${resultRecordCount}&resultOffset=${resultOffset}",
  "${featureId}?f=pjson",
  "Kartleggingsenhet5kid",
  "temp/kartleggingsenhet"
)
.catch(err => log.fatal(err));
mirrorJson(
  "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/${layer}/",
  11,
  "query?where=1=1&f=pjson&returnCountOnly=false&resultRecordCount=${resultRecordCount}&resultOffset=${resultOffset}",
  "${featureId}?f=pjson",
  "Kartleggingsenhet5kid",
  "temp/kartleggingsenhet"
)
.catch(err => log.fatal(err));
}

/*

  geometry: import_nin.områder5k
  geometry: import_nin.områder20k

  https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/1/1
  import_nin.kartleggingsenheter5k
  OBJECTID - "objectid"
  Kartleggingsenhetkode - "kartleggingsenhetkode"
  Andel - "andel"
  Kartlagtdato - "kartlagtdato"
  Kartleggingsenhet5kid - "kartleggingsenhet5kid"
  Kartlegger - "brukernavn"
  Kartleggingsenhetmerknad - "merknad"
  Område5kid - "område5kid"
  Kartleggingsenhet5kguid - "kartleggingsenhet5kguid"
  Område5kguid - "område5kguid"

  https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/0/1
  import_nin.kartleggingsenheter20k
  OBJECTID - objectid
  Kartleggingsenhetkode - kartleggingsenhetkode
  Andel - andel
  Kartlagtdato - kartlagtdato
  Kartleggingsenhet20kid - kartleggingsenhet20kid
  Kartlegger - brukernavn
  Kartleggingsenhetmerknad - merknad
  Område20kid - område20kid
  Kartleggingsenhet20kguid - kartleggingsenhet20kguid
  Område20kguid - område20kguid

  https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/11/1
  import_nin.variabler5k
  OBJECTID - "objectid"
  Variabelkode - "variabelkode"
  Variabel5kid - "variabel5kid"
  Kartleggingsenhet5kid - "kartleggingsenhet5kid"
  Variabeltype - "variabeltype"
  Kartlagtdato - "kartlagtdato"
  ??? - "brukernavn"
  Merknad - "merknad"
  Variabel5kguid - "variabel5kguid"
  Kartleggingsenhet5kguid - "kartleggingsenhet5kguid"

  https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/12/1
  import_nin.variabler20k
  OBJECTID - "objectid"
  Variabelkode - "variabelkode"
  Variabel20kid - "variabel20kid"
  Kartleggingsenhet20kid - "kartleggingsenhet20kid"
  Variabeltype - "variabeltype"
  Kartlagtdato - "kartlagtdato"
  ??? - "brukernavn"
  Merknad - "merknad"
  Variabel20kguid - "variabel20kguid"
  Kartleggingsenhet20kguid - "kartleggingsenhet20kguid"

  https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/13/1
  https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/14/1
  import_nin.kode_ulkm
  OBJECTID - "objectid"
  Ulkmkode - "ulkmkode"
  Ninhovedtypegruppe - "ninhovedtypegruppe"
  Ninhovedtype - "ninhovedtype"
  Gradientkode - "gradientkode"
  Gradientkodebeskrivelse - "gradientkodebeskrivelse"
  Trinn - "trinn"
  Trinndefinisjon - "trinndefinisjon"
  Trinnbeskrivelse - "trinnbeskrivelse"
  Merknad - "merknad"



docker stop forvaltningsportal-postgres
docker rm -f forvaltningsportal-postgres

docker run -d \
  --name forvaltningsportal-postgres \
  -p 5434:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e PGDATA=/var/lib/postgresql/data/pgdata \
  -v /home:/home \
  -v /dockerdata/forvaltningsportal-postgres:/var/lib/postgresql/data \
  postgis/postgis

docker stop postgrest
docker rm -f postgrest

docker run -d \
  --name postgrest \
  -p 3000:3000 \
  -e PGRST_DB_URI="postgres://postgres:postgres@172.17.0.2/postgres" \
  -e PGRST_DB_ANON_ROLE="postgres" \
  postgrest/postgrest

docker run -p 8888:80 \
  -e 'PGADMIN_DEFAULT_EMAIL=admin@frak.no' \
  -e 'PGADMIN_DEFAULT_PASSWORD=admin' \
  -d dpage/pgadmin4



*/


mirrorJson(
  "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/${layer}/",
  0,
  "query?where=1=1&f=pjson&returnCountOnly=false&resultRecordCount=${resultRecordCount}&resultOffset=${resultOffset}",
  "${featureId}?f=pjson",
  "Kartleggingsenhet20kid",
  "temp/2021_06_26/0",
  true
)
.catch(err => log.fatal(err));
mirrorJson(
  "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/${layer}/",
  12,
  "query?where=1=1&f=pjson&returnCountOnly=false&resultRecordCount=${resultRecordCount}&resultOffset=${resultOffset}",
  "${featureId}?f=pjson",
  "Kartleggingsenhet20kid",
  "temp/2021_06_26/12"
)
.catch(err => log.fatal(err))
// .then(() => {
mirrorJson(
  "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/${layer}/",
  1,
  "query?where=1=1&f=pjson&returnCountOnly=false&resultRecordCount=${resultRecordCount}&resultOffset=${resultOffset}",
  "${featureId}?f=pjson",
  "Kartleggingsenhet5kid",
  "temp/2021_06_26/1",
  true
)
.catch(err => log.fatal(err));
mirrorJson(
  "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/${layer}/",
  11,
  "query?where=1=1&f=pjson&returnCountOnly=false&resultRecordCount=${resultRecordCount}&resultOffset=${resultOffset}",
  "${featureId}?f=pjson",
  "Kartleggingsenhet5kid",
  "temp/2021_06_26/11"
)
.catch(err => log.fatal(err));
// .then(() => {
mirrorJson(
  "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/${layer}/",
  13,
  "query?where=1=1&f=pjson&returnCountOnly=false&resultRecordCount=${resultRecordCount}&resultOffset=${resultOffset}",
  "${featureId}?f=pjson",
  "Kartleggingsenhet5kid",
  "temp/2021_06_26/13"
)
.catch(err => log.fatal(err));
mirrorJson(
  "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/${layer}/",
  14,
  "query?where=1=1&f=pjson&returnCountOnly=false&resultRecordCount=${resultRecordCount}&resultOffset=${resultOffset}",
  "${featureId}?f=pjson",
  "Kartleggingsenhet20kid",
  "temp/2021_06_26/14"
)
.catch(err => log.fatal(err));
// });
// });

async function mirrorJson(url, layer, queryUrl, featureUrl, featureName, jsonBasePath, hasGeometry = false, options = { batchSize: 1000, offset: 0, httpheaders: { timeout: 60000 } }) {
  io.mkdir(jsonBasePath);
  let jsonBaseIdPath = `${jsonBasePath}`;
  // jsonBasePath = `${jsonBasePath}/${pad(layer, 2)}`;
  // log.info(jsonBasePath);
  // io.mkdir(jsonBasePath);
  // io.mkdir(`${jsonBaseIdPath}`);
  jsonBaseIdPath += `/${pad(layer, 2)}_`;

  let countPart = await downloadCount(`${url.replace("${layer}", layer)}${queryUrl}`, options.httpheaders);
  const count = JSON.parse(countPart).count;
  log.info(`${layer} RecordCount: ${count}`);
  const digits = `${count}`.length;

  let start = 0;
  const step = 100000;

  while (true) {
    mirrorSkip(start, start + step, digits, jsonBaseIdPath, url, layer, featureUrl, featureName, options);

    if (hasGeometry) {
      //                     &geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&returnGeometry=true&returnTrueCurves=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&returnExtentOnly=false&featureEncoding=esriDefault&f=geojson&outSR=
      // let geometryUrl = "&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&returnGeometry=true&returnTrueCurves=true&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&returnExtentOnly=false&featureEncoding=esriDefault&f=geojson";
      let geometryUrl = "&geometryType=esriGeometryPolygon&returnGeometry=true&returnTrueCurves=true&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&returnExtentOnly=false&featureEncoding=esriDefault&f=geojson";
      mirrorGeomSkip(start, start + step, digits, jsonBaseIdPath, url + "query?objectIds=${featureId}", layer, geometryUrl, featureName, options);
    }

    start += step;
    if (start > count) break;
    // break;
  }
}

async function mirrorSkip(start, end, digits, jsonBaseIdPath, url, layer, featureUrl, featureName, options = { batchSize: 1000, offset: 0, httpheaders: { timeout: 60000 } }) {
  // let skipped = false;
  let featureId = start;
  while (true) {
    featureId++;
    const part = await downloadFeature(`${url.replace("${layer}", layer)}${featureUrl}`, featureId, options.httpheaders);
    const json = JSON.parse(part);
    if (!json.feature) break;

    const id = json.feature.attributes[featureName]
    // remove garbage from json
    json.feature = Object.assign({}, {attributes: json.feature.attributes});
    fs.writeFileSync(`${jsonBaseIdPath}${pad(featureId, digits)}_${id}.json`, JSON.stringify(json));

    // if (skipped) break;
    // if (featureId > 1) break;
    if (featureId >= end) break;
  }
}

async function mirrorGeomSkip(start, end, digits, jsonBaseIdPath, url, layer, featureUrl, featureName, options = { batchSize: 1000, offset: 0, httpheaders: { timeout: 60000 } }) {
  // let skipped = false;
  let featureId = start;
  while (true) {
    featureId++;
    const part = await downloadFeature(`${url.replace("${layer}", layer)}${featureUrl}`, featureId, options.httpheaders);
    const json = JSON.parse(part);
    if (!json.features) break;

    const id = json.features[0].properties[featureName]
    // remove garbage from json
    const jsonGeom = Object.assign({ "crs": json.crs }, json.features[0]);
    // const jsonGeom = Object.assign({}, json.features[0]);
    // jsonGeom.crs = json.crs;
    fs.writeFileSync(`${jsonBaseIdPath}${pad(featureId, digits)}_${id}.geojson`, JSON.stringify(jsonGeom));

    // if (skipped) break;
    // if (featureId > 1) break;
    if (featureId >= end) break;
  }
}

/**
 * Mirror a remote WFS server
 * Downloads batches of 500 features per request.
 */
async function mirror(url, featureUrl, jsonlFilePath, jsonlFilePathTmp, options = { batchSize: 1000, offset: 0, httpheaders: { timeout: 60000 } }) {
  let jsonlines = jsonlFilePath + ".lines.json";
  //jsonlFilePath += "." + options.offset
  io.mkdir(path.dirname(jsonlFilePath));
  if (fs.existsSync(jsonlFilePath))
    fs.unlinkSync(jsonlFilePath)
  if (fs.existsSync(jsonlFilePathTmp))
    fs.unlinkSync(jsonlFilePathTmp)
  if (fs.existsSync(jsonlines))
    fs.unlinkSync(jsonlines)
  log.info("Mirroring WFS " + url + " to " + jsonlFilePath);
  let resultRecordCount = options.batchSize || 1000;
  let resultOffset = options.offset || 0;
  let featureCount = 0;
  // fs.writeFileSync(jsonlFilePathTmp, "");
  fs.writeFileSync(jsonlFilePathTmp, "{\"type\":\"FeatureCollection\",\"name\":\"polygons\",\"features\":[\n");
  // fs.writeFileSync(jsonlFilePathTmp, "{\"type\":\"FeatureCollection\",\"name\":\"polygons\",\"crs\":{\"type\":\"name\",\"properties\":{\"name\":\"urn:ogc:def:crs:EPSG::25833\"}},\"features\":[\n");
  // fs.writeFileSync(jsonlFilePathTmp, "{\"type\":\"FeatureCollection\",\"name\":\"polygons\",\"crs\":{\"type\":\"name\",\"properties\":{\"name\":\"urn:ogc:def:crs:EPSG::25833\"}},\"features\":[\n");

  // resultRecordCount = 5;

  let countPart = await downloadCount(url, options.httpheaders);
  log.info(`RecordCount: ${JSON.parse(countPart).count}`);

  const wfsFeatures = {};

  let featureKey;

  while (true) {
    const part = await downloadPart(url, resultOffset, resultRecordCount, options.httpheaders);
    const geojson = JSON.parse(part);
    const features = geojson.features;
    if (features.length <= 0) break;
    const lines = features.map(f => {
      for (let key in f.properties) {
        if (!featureKey) featureKey = key;
        // log.info(key, f.properties[key]);
        wfsFeatures[f.properties[key]] = f;
      }
      // return JSON.stringify(f);
      return JSON.stringify(f) + ",";
    }).join("\n") + "\n";
    featureCount += features.length;
    // fs.appendFileSync(jsonlFilePath, lines);
    fs.appendFileSync(jsonlFilePathTmp, lines);
    resultOffset += resultRecordCount;
    // break;
  }

  log.info(`FeatureCount: ${featureCount}`);

  fs.appendFileSync(jsonlFilePathTmp, "{}]\n}");

  fs.writeFileSync(jsonlFilePath, "{\"type\":\"FeatureCollection\",\"name\":\"polygons\",\"crs\":{\"type\":\"name\",\"properties\":{\"name\":\"urn:ogc:def:crs:EPSG::25833\"}},\"features\":[\n");
  fs.writeFileSync(jsonlines, "");

  let featureId = 0;
  while (true) {
    featureId++;
    // if (featureId > featureCount) break;
    const part = await downloadFeature(featureUrl, featureId, options.httpheaders);
    const json = JSON.parse(part);
    if (!json.feature) break;
    if (!wfsFeatures[json.feature.attributes[featureKey]]) continue;
    wfsFeatures[json.feature.attributes[featureKey]].properties = Object.assign(wfsFeatures[json.feature.attributes[featureKey]].properties, json.feature.attributes);
    wfsFeatures[json.feature.attributes[featureKey]].properties.kode = featureKey;

    if (featureId > 1) {
      fs.appendFileSync(jsonlFilePath, ",\n" + JSON.stringify(wfsFeatures[json.feature.attributes[featureKey]]));
      fs.appendFileSync(jsonlines, "\n" + JSON.stringify(wfsFeatures[json.feature.attributes[featureKey]]));
    }
    else {
      fs.appendFileSync(jsonlFilePath, JSON.stringify(wfsFeatures[json.feature.attributes[featureKey]]));
      fs.appendFileSync(jsonlines, JSON.stringify(wfsFeatures[json.feature.attributes[featureKey]]));
    }
    // fs.appendFileSync(jsonlines, JSON.stringify(json) + "\n");
    // if (featureId > 1)
    //   fs.appendFileSync(jsonlFilePath, ",\n" + JSON.stringify(json));
    // else
    //   fs.appendFileSync(jsonlFilePath, JSON.stringify(json));
  }
  fs.appendFileSync(jsonlFilePath, "\n]\n}");

  log.info("features:" , featureCount);
  // log.info(wfsFeatures);
  log.info(Object.keys(wfsFeatures).length);

  log.info("Read " + featureCount + " features from " + url);
  return featureCount;
}

async function downloadCount(url, headers) {
  url = url.replace("&returnCountOnly=false", "&returnCountOnly=true");
  url = url.replace('${resultRecordCount}', "")
  url = url.replace('${resultOffset}', "")
  return downloadStuff(url, null, headers);
}

async function downloadPart(url, resultOffset, resultRecordCount, headers) {
  url = url.replace('${resultRecordCount}', resultRecordCount)
  url = url.replace('${resultOffset}', resultOffset)
  return downloadStuff(url, null, headers);
}

async function downloadFeature(url, featureId, headers) {
  url = url.replace('${featureId}', featureId)
  return downloadStuff(url, null, headers);
}

async function downloadStuff(url, targetFile, headers = {}) {
  let firstOrError = true;
  let retries = 0;
  let buffer;
  while(firstOrError && retries < 9) {
    try {
      buffer = await http.downloadBinary(url, targetFile, headers);
      firstOrError = false;
      log.info(url);
    } catch (error) {
      retries++;
      // log.error(error);
      log.error(`downloadStuff failed - retry ${retries}`);
      await sleep(2000);
    }
  }
  return await buffer.toString();
}

async function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}