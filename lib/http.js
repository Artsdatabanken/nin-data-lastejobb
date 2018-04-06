const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const log = require('./log')
const io = require('./io')

function fetchJson(url) {
  const data = fetch(url)
  return JSON.parse(data)
}

async function downloadJson2File(url, targetFile) {
  log.v('Download ' + url)
  const response = await fetch(url)
  let text = ''
  log.d('HTTP status ' + response.status)
  if (response.status !== 200) {
    const httpText = response.status + ' ' + response.statusText
    log.e(httpText)
    const body = await response.text()
    log.e(body)
    throw new Error(httpText)
  }
  const json = await response.json()
  io.writeJson(targetFile, json)
}

async function downloadBinary2File(url, targetFile) {
  log.v('Download binary ' + url)
  const response = await fetch(url).then()
  const buffer = await response.buffer()
  io.writeBinary(targetFile, buffer)
}

async function getJsonFromCache(url, targetFile) {
  const inCache = fs.existsSync(targetFile)
  if (!inCache) await downloadJson2File(url, targetFile)
  return io.readJson(targetFile)
}

async function getBinaryFromCache(url, targetFile) {
  const inCache = fs.existsSync(targetFile)
  if (!inCache) await downloadBinary2File(url, targetFile)
  return io.readBinary(targetFile)
}

module.exports = {
  fetchJson,
  downloadJson2File,
  downloadBinary2File,
  getJsonFromCache,
  getBinaryFromCache
}
