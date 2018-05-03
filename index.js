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
  log.info("Kjører " + jsFile)
  const r = spawnSync("node", [jsFile], {
    encoding: "buffer",
    shell: true,
    stdio: [0, 1, 2]
  })
  //  console.log(r)
  if (r.status > 0) process.exit(1)
  //    throw new Error(jsFile + " failed with exit code " + r.status)
  log.success("Done.")
}

let files = findFiles(config.lasteScriptPath, ".js")
files = files.sort()
log.info("Fant totalt " + files.length + " skriptfiler")
log.debug("Scriptfiler: " + files)
files = files.filter(file => file.indexOf(".test") < 0)
log.info("Kjører " + files.length + " lastejobber...")
files.forEach(file => exec(file))
