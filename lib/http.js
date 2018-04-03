const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const log = require('./log')
const { writeJson, writeBinary } = require('./io')

function fetchJson(url) {
  const data = fetch(url)
  return JSON.parse(data)
}

async function downloadJson2File(url, targetFile) {
  log.v('Download ' + url)
  const response = await fetch(url)
  const json = await response.json()
  writeJson(targetFile, json)
}

async function downloadBinary2File(url, targetFile) {
  log.v('Download binary ' + url)
  const response = await fetch(url).then()
  const buffer = await response.buffer()
  writeBinary(targetFile, buffer)
}

module.exports = {
  writeJson,
  fetchJson,
  downloadJson2File,
  downloadBinary2File
}
