// @flow
if (!process.env.DEBUG) process.env.DEBUG = "*"
const fs = require("fs")
const { spawnSync } = require("child_process")
const path = require("path")
const fetch = require("node-fetch")
const log = require("log-less-fancy")()
const { findFiles } = require("./lib/io")
const config = require("./config")

function exec(jsFile) {
  log.debug("Kjører " + jsFile)
  const r = spawnSync("node", ["--max_old_space_size=2096", jsFile], {
    encoding: "buffer",
    shell: true,
    stdio: [0, 1, 2]
  })
  if (r.status > 0) process.exit(1)
}

let files = findFiles(config.lasteScriptPath, ".js")
files = files.sort()
log.info("Fant totalt " + files.length + " skriptfiler")
log.debug("Scriptfiler: " + files)
files = files.filter(file => file.indexOf(".test") < 0)
log.info("Kjører " + files.length + " lastejobber...")
files.forEach(file => exec(file))
