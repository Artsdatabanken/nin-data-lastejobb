const fs = require('fs')
const { spawnSync } = require('child_process')
const path = require('path')
const fetch = require('node-fetch')
const log = require('./lib/log')
const { findFiles } = require('./lib/io')
const config = require('./config')

log.logLevel = config.logLevel

function exec(jsFile) {
  log.i('Kjører ' + jsFile)
  const r = spawnSync('node', [jsFile])
  log.w(r.stdout.toString())
  if (r.stderr.toString().length > 0) log.e(r.stderr.toString())
  if (r.status > 0) {
    throw new Error(jsFile + ' failed with exit code ' + r.status)
  }
}

let files = findFiles(config.lasteScriptPath, '*.js')
files = files.sort()
log.v('Fant totalt ' + files.length + ' skriptfiler')
log.d('Scriptfiler: ' + files)
files = files.filter(file => file.indexOf('.test') < 0)
log.i('Kjører ' + files.length + ' lastejobber...')
files.forEach(file => exec(file))
