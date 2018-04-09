if (!process.env.DEBUG) process.env.DEBUG = "*";
const path = require("path");
const http = require("../../lib/http");
const config = require("../../config");
const log = require("log-less-fancy")();

// Laster ned arter fra Artsdatabanken sitt API
http
  .downloadBinary2File(
    config.datakilde.AR_taxon,
    config.getDataPath(__filename)
  )
  .catch(err => {
    log.error(err);
    process.exit(99);
  });

if (false)
  http
    .downloadJson2File(
      config.datakilde.AR_taxon,
      config.getDataPath(__filename)
    )
    .catch(err => {
      log.error(err);
      process.exit(99);
    });
