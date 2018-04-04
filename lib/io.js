const fs = require('fs-extra')
const path = require('path')
const fetch = require('node-fetch')
const log = require('./log')
const { capitalizeTittel } = require('./koder')

function getLength(o) {
  if (o.length) return o.length
  return Object.keys(o).length
}

function fetchJson(url) {
  const data = fetch(url)
  return JSON.parse(data)
}

function skrivLoggLinje(aksjon, filePath, json) {
  let produsert = null
  if (json.meta && json.meta.produsert)
    produsert = new Date(json.meta.produsert)
  else produsert = new Date(fs.statSync(filePath).ctime)
  const now = new Date()
  const timerGammel = Math.round(10 * (now - produsert) / 1000 / 60 / 60) / 10

  if (json.data) json = json.data
  log.v(
    'Lest ' +
      getLength(json) +
      ' elementer fra ' +
      timerGammel +
      ' timer gammel fil.'
  )
}

function readCsv(filePath, delimiter = ';') {
  log.v('Åpner ' + filePath)
  const data = fs.readFileSync(filePath, 'utf8')
  const rows = data.toString().split('\n')
  const fields = rows
    .splice(0, 1)[0]
    .trim('\r')
    .split(delimiter)
  var r = []
  rows.forEach(line => {
    let row = line.split(';')
    let record = {}
    for (let i = 0; i < fields.length; i++) record[fields[i]] = row[i]
    r.push(record)
  })
  return r
}

function readJson(filePath) {
  log.v('Åpner ' + filePath)
  const data = fs.readFileSync(filePath, 'utf8')
  const json = JSON.parse(data)
  delete json.meta
  skrivLoggLinje('Lest', filePath, json)
  return json
}

function readBinary(filePath) {
  log.v('Åpner ' + filePath)
  const data = fs.readFileSync(filePath, 'utf8')
  return data
}

function writeJson(filePath, o) {
  if (!filePath) throw new Error('Filename is required')
  if (!o) throw new Error('No data provided')
  log.v('Writing ' + filePath)
  const basename = path.basename(filePath, '.json')
  const dokument = Object.assign(
    {
      meta: {
        tittel: capitalizeTittel(basename.replace(/_/g, ' ')),
        produsert: new Date().toJSON(),
        utgiver: 'Artsdatabanken',
        url: `https://firebasestorage.googleapis.com/v0/b/grunnkart.appspot.com/o/koder%2F${path.basename(
          filePath
        )}?alt=media`,
        elementer: getLength(o)
      }
    },
    o
  )
  const dir = path.dirname(filePath)
  mkdir(dir)
  fs.writeFileSync(filePath, JSON.stringify(dokument), 'utf8')
  log.v('Skrevet ' + getLength(o) + ' elementer')
}

async function getJsonFromCache(url, targetFile) {
  const inCache = fs.existsSync(targetFile)
  if (!inCache) await downloadJson2File(url, targetFile)
  return readJson(targetFile)
}

async function getBinaryFromCache(url, targetFile) {
  const inCache = fs.existsSync(targetFile)
  if (!inCache) await downloadBinary2File(url, targetFile)
  return readBinary(targetFile)
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
    if (stat.isDirectory()) r = r.concat(findFiles(filename, filter))
    else if (filter && filter !== path.parse(filename).ext) {
    } else r.push(filename)
  }
  return r
}

module.exports = {
  readJson,
  readCsv,
  writeJson,
  fetchJson,
  findFiles,
  fileExists,
  mkdir,
  getBinaryFromCache,
  getJsonFromCache
}
