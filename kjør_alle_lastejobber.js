const fs = require('fs')
const { spawnSync } = require('child_process')
const path = require('path')
const fetch = require('node-fetch')
const log = require('./lib/log')
const { findFiles } = require('./lib/io')

log.logLevel = 4

function exec(jsFile) {
  log.i('Kjører ' + jsFile)
  const r = spawnSync('node', [jsFile])
  log.w(r.stdout.toString())
  if (r.stderr.toString().length > 0) log.e(r.stderr.toString())
  if (r.status > 0) {
    throw new Error(jsFile + ' failed with exit code ' + r.status)
  }
}

let files = findFiles('steg')
files = files.sort()
console.log(files)
files.forEach(file => exec(file))
