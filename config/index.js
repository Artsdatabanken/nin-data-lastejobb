if (!process.env.DEBUG) process.env.DEBUG = "*"
const path = require("path")
const datakilde = require("./datakilde")
const kodesystem = require("./kodesystem")
const cachePath = "./cache"

const config = {
  // Navnet på attributtet som inneholder data for noden selv
  DATAKEY: "@",
  kodesystem: kodesystem,
  lasteScriptPath: "./steg/",
  datakilde: datakilde,
  infoUrl: {
    nin: "https://www.artsdatabanken.no/NiN2.0/",
    verneområde: "http://faktaark.naturbase.no/Vern?id="
  },
  kildedataPath: "./kildedata",
  getCachePath: function(relPath) {
    return cachePath + "/" + relPath + "/"
  },
  dataRoot: "./data",
  getDataPath: function(relPath, extension = ".json") {
    const filename = path.basename(relPath, path.extname(relPath)) + extension
    return this.dataRoot + "/" + filename.replace(".test", "")
  }
}

module.exports = config
