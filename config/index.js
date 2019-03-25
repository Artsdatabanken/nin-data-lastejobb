if (!process.env.DEBUG) process.env.DEBUG = "*"
const path = require("path")
const datakilde = require("./datakilde")
const cachePath = "./cache"

const config = {
  // Navnet på attributtet som inneholder data for noden selv
  DATAKEY: "@",
  lasteScriptPath: "./steg/",
  datakilde: datakilde,
  webserver: "https://data.artsdatabanken.no/",
  infoUrl: {
    nin: "https://www.artsdatabanken.no/NiN2.0/",
    verneområde: "http://faktaark.naturbase.no/Vern?id="
  },
  kildedataPathOld: "./kildedata",
  kildedataPath: "./nin-data",
  getCachePath: function(relPath) {
    return cachePath + "/" + relPath + "/"
  },
  dataRoot: "./data",
  buildRoot: "./build",
  getDataPath: function(relPath, extension = ".json") {
    const filename = path.basename(relPath, path.extname(relPath)) + extension
    return this.dataRoot + "/" + filename.replace(".test", "")
  },
  getBuildPath: function(relPath, extension = ".json") {
    const filename = path.basename(relPath, path.extname(relPath)) + extension
    return this.buildRoot + "/" + filename.replace(".test", "")
  }
}

module.exports = config
