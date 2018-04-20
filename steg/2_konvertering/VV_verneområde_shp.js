const io = require("../../lib/io")
const http = require("../../lib/http")
const path = require("path")
const config = require("../../config")
const log = require("log-less-fancy")()

// Pakk ut .shp fra .zip
var DecompressZip = require("decompress-zip")
const filename = config.getDataPath("inn_verneområde", ".zip")

var unzipper = new DecompressZip(filename)
unzipper.on("error", function(err) {
  log.fatal(err)
  process.exit(1)
})

unzipper.on("extract", function(json) {
  log.debug(json)
})

unzipper.on("progress", function(fileIndex, fileCount) {
  log.debug("Extracted file " + (fileIndex + 1) + " of " + fileCount)
})

unzipper.extract({
  path: config.getDataPath(__filename, ""),
  strip: 2, // Fjern de 2 katalognivåene i zippen
  filter: function(file) {
    return file.type !== "SymbolicLink"
  }
})
