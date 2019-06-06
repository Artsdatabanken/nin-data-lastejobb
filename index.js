// @flow
if (!process.env.DEBUG) process.env.DEBUG = "*"
const { spawnSync } = require("child_process")
const { io, log } = require("lastejobb")
const config = require("./config")

function exec(jsFile) {
  log.debug("================= " + jsFile)
  const r = spawnSync("node", ["--max_old_space_size=2096", `"${jsFile}"`], {
    encoding: "buffer",
    shell: true,
    stdio: [0, 1, 2]
  })
  if (r.status > 0) process.exit(1)
}

let files = io.findFiles(config.lasteScriptPath, ".js")
files = files.sort()
log.info("Fant " + files.length + " lastejobber")
files = files.filter(file => file.indexOf(".test") < 0)
files.forEach(file => exec(file))
