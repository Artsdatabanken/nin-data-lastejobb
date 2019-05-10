const execSync = require("child_process").execSync
const fs = require("fs")

function git(cmd, args = "") {
  execSync("git " + cmd + " " + args)
}

function clone(url, destFolder) {
  if (fs.existsSync(destFolder)) pull(destFolder)
  // only latest version
  else {
    fs.mkdirSync(destFolder)
    git(`clone --depth=1 ${url}`)
  }
}

function pull(destFolder) {
  git(`-C ${destFolder} pull`)
}

module.exports = {}
