// @flow
const fs = require("fs-extra")
const path = require("path")
const fetch = require("node-fetch")
const log = require("log-less-fancy")()
const { capitalizeTittel } = require("@artsdatabanken/typesystem")
const config = require("../config")

function getLength(o) {
  if (o.length) return o.length
  return Object.keys(o).length
}

function fetchJson(url) {
  const data = fetch(url)
  return JSON.parse(data)
}

function lesKildedatafil(filename, defaultJson) {
  const jsonPath = config.kildedataPath + "/" + filename + ".json"
  return readJson(jsonPath, defaultJson)
}

function lesKildedatafilOld(filename, defaultJson) {
  const jsonPath = config.kildedataPathOld + "/" + filename + ".json"
  return readJson(jsonPath, defaultJson)
}

function lesDatafil(filename, extension, defaultJson) {
  const jsonPath = config.getDataPath(filename, extension)
  return readJson(jsonPath, defaultJson)
}

function lesBuildfil(filename, extension, defaultJson) {
  const jsonPath = config.getBuildPath(filename, extension)
  return readJson(jsonPath, defaultJson)
}

function skrivKildedatafil(filename, o) {
  const jsonPath = config.kildedataPath + "/" + filename + ".json"
  return writeJson(jsonPath, o, "\t")
}

function skrivDatafil(filename, o) {
  const jsonPath = config.getDataPath(filename)
  return writeJson(jsonPath, o)
}

function skrivBuildfil(filename, o) {
  const jsonPath = config.getBuildPath(filename)
  return writeJson(jsonPath, o)
}

function skrivLoggLinje(aksjon, filePath, json) {
  let produsertUtc = null
  if (json.meta && json.meta.produsertUtc)
    produsertUtc = new Date(json.meta.produsertUtc)
  else produsertUtc = new Date(fs.statSync(filePath).ctime)
  const now = new Date()
  const timerGammel =
    Math.round((10 * (now - produsertUtc)) / 1000 / 60 / 60) / 10

  if (json.data) json = json.data
  log.info(
    "Lest " +
      getLength(json) +
      " elementer fra " +
      timerGammel +
      " timer gammel fil."
  )
}

// Read file, parse to JSON.  If file doesn't exists defaultJson will be returned
function readJson(filePath, defaultJson) {
  log.info("Åpner " + filePath)
  if (defaultJson && !fs.existsSync(filePath)) return defaultJson
  let data = fs.readFileSync(filePath, "utf8")
  //  data = data.replace(/^\uFEFF/, '') // node #fail https://github.com/nodejs/node/issues/6924
  if (data.charCodeAt(0) === 0xfeff) data = data.slice(1)
  let json = JSON.parse(data)
  delete json.meta
  //  if (Object.keys(json).length === 1) json = json[Object.keys(json)[0]]
  skrivLoggLinje("Lest", filePath, json)
  return json
}

function readBinary(filePath) {
  log.info("Åpner " + filePath)
  const data = fs.readFileSync(filePath, "utf8")
  return data
}

function writeJson(filePath, o, delimiter) {
  const basename = path.basename(filePath, ".json")
  let dokument = Array.isArray(o) ? { data: o } : o
  const meta = dokument.meta
  dokument.meta = {
    tittel: capitalizeTittel(basename.replace(/_/g, " ")),
    produsertUtc: new Date().toJSON(),
    utgiver: "Artsdatabanken",
    url: `https://data.artsdatabanken.no/${path.basename(filePath)}`,
    tool: { name: "kverna", url: "https://github.com/Artsdatabanken/kverna/" },
    elementer: getLength(o)
  }
  if (meta) Object.assign(dokument.meta, meta)
  const bytes = writeBinary(filePath, JSON.stringify(dokument, null, delimiter))
  log.info("Skrevet " + getLength(o) + " elementer, " + bytes + " bytes")
}

function writeBinary(filePath, o) {
  if (!filePath) throw new Error("Filename is required")
  if (!o) throw new Error("No data provided")
  log.info("Writing " + filePath)
  const dir = path.dirname(filePath)
  mkdir(dir)
  fs.writeFileSync(filePath, o, "utf8")
  return o.length
}

function mkdir(path) {
  fs.ensureDirSync(path)
}

function fileExists(path) {
  return fs.existsSync(path)
}

// Recursive find files in startPath satisfying filter
function findFiles(startPath, filter) {
  let r = []
  var files = fs.readdirSync(startPath)
  for (var file of files) {
    var filename = path.join(startPath, file)
    var stat = fs.lstatSync(filename)
    if (stat.isDirectory()) {
      r = r.concat(findFiles(filename, filter))
    } else if (filter && filter !== path.parse(filename).ext) {
    } else r.push(filename)
  }
  return r
}

module.exports = {
  /* lesKildedatafil,
  lesKildedatafilOld,
  lesDatafil,
  lesBuildfil,
  readJson,
  writeBinary,
  writeJson,
  skrivKildedatafil,
  skrivDatafil,
  skrivBuildfil,
  fetchJson,
  findFiles,
  fileExists,
  mkdir*/
}
