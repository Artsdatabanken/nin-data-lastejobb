const { config, log, wfs, http, io } = require("@artsdatabanken/lastejobb");
const fs = require("fs");
const path = require("path");

// Laster ned statistikk per kode, arealer, antall arter innenfor geometri
// { "AO_06-27-VV": { "area": 4798855, "observations": 778, "areas": 15 } },
// areal: dekket av denne koden
// observations: antall arter observert innenfor denne koden sitt areal
// areas: antall geometrier i undernivåer
log.info(config.getTempPath("wfs_kartleggingsenhet_20k.json"));

// where=1=1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&having=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&historicMoment=&returnDistinctValues=false&queryByDistance=&returnExtentOnly=false&datumTransformation=&parameterValues=&rangeValues=&quantizationParameters=&featureEncoding=esriDefault&f=geojson
// where=1=1&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&returnGeometry=true&returnTrueCurves=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&returnExtentOnly=false&featureEncoding=esriDefault&f=geojson

// //wfs.
// mirror(
//   "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/0/query?where=1=1&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&returnGeometry=true&returnTrueCurves=true&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&returnExtentOnly=false&featureEncoding=esriDefault&f=geojson&resultRecordCount=${resultRecordCount}&resultOffset=${resultOffset}",
//   "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/0/${featureId}?f=pjson",
//   "temp/wfs_kartleggingsenhet_20k.4326.json",
//   "temp/wfs_kartleggingsenhet_20k.4326.tmp.json"
//   // , { batchSize: 1000 }
// )
// .catch(err => log.fatal(err));

mirror(
  "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/0/query?where=1=1&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&returnGeometry=true&returnTrueCurves=true&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&returnExtentOnly=false&featureEncoding=esriDefault&f=geojson&resultRecordCount=${resultRecordCount}&resultOffset=${resultOffset}&outSR=25833",
  "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/0/${featureId}?f=pjson",
  "temp/wfs_kartleggingsenhet_20k.25833.json",
  "temp/wfs_kartleggingsenhet_20k.25833.tmp.json"
  // , { batchSize: 1000 }
)
.catch(err => log.fatal(err));

// // wfs.
// mirror(
//   "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/1/query?where=1=1&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&returnGeometry=true&returnTrueCurves=true&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&returnExtentOnly=false&featureEncoding=esriDefault&f=geojson&resultRecordCount=${resultRecordCount}&resultOffset=${resultOffset}&outSR=25833",
//   "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/1/${featureId}?f=pjson",
//   "temp/wfs_kartleggingsenhet_5k.25833.json",
//   "temp/wfs_kartleggingsenhet_5k.25833.tmp.json"
//   // , { batchSize: 1000 }
// )
// .catch(err => log.fatal(err));

// // wfs.
// mirror(
//   "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/11/query?where=1=1&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&returnGeometry=true&returnTrueCurves=true&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&returnExtentOnly=false&featureEncoding=esriDefault&f=geojson",
//   "temp/wfs_beskrivelsesvariabler_5k.4326.json",
//   "temp/wfs_beskrivelsesvariabler_5k.4326.tmp.json",
//   { batchSize: 800 }
// )
// .catch(err => log.fatal(err));

// wfs.
// mirror(
//   "https://kart.miljodirektoratet.no/arcgis/rest/services/kartleggingsenheter_nin/MapServer/12/query?where=1=1&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&returnGeometry=true&returnTrueCurves=true&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&returnExtentOnly=false&featureEncoding=esriDefault&f=geojson",
//   "temp/wfs_beskrivelsesvariabler_20k.json",
//   "temp/wfs_beskrivelsesvariabler_20k.tmp.json",
//   { batchSize: 900 }
// )
// .catch(err => log.fatal(err));

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

  const wfsFeatures = {};

  let featureKey;

  while (true) {
    let part;
    let firstOrError = true;
    let retries = 0;
    while(firstOrError && retries < 9) {
      try {
        part = await downloadPart(url, resultOffset, resultRecordCount, options.httpheaders);
        firstOrError = false;
      } catch (error) {
        retries++;
        log.error(error);
        log.error("downloadPart failed - retry");
      }
    }
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

async function downloadPart(url, resultOffset, resultRecordCount, headers) {
  url = url.replace('${resultRecordCount}', resultRecordCount)
  url = url.replace('${resultOffset}', resultOffset)
  log.info(url);
  const buffer = await http.downloadBinary(url, null, headers);
  return await buffer.toString();
}

async function downloadFeature(url, featureId, headers) {
  url = url.replace('${featureId}', featureId)
  log.info(url);
  const buffer = await http.downloadBinary(url, null, headers);
  return await buffer.toString();
}