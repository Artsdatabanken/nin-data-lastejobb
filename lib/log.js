// Skriver loggmeldinger i farger

const util = require('util')

const color = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  lightgreen: '\033[1;32m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  normal: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m'
}

if (process.env.NODE_DISABLE_COLORS)
  Object.keys(color).forEach(key => (color[key] = ''))

class Log {
  constructor() {
    // 1=error, 2=warning, 3=info, 4=verbose, 5=debug
    this.logLevel = 4
  }

  d(...args) {
    if (this.logLevel > 4)
      console.log(
        color.normal + color.dim,
        util.format.apply(null, args),
        color.normal
      )
  }
  v(...args) {
    if (this.logLevel > 3)
      console.log(color.normal, util.format.apply(null, args), color.normal)
  }
  i(...args) {
    if (this.logLevel > 2)
      console.log(color.cyan, util.format.apply(null, args), color.normal)
  }
  w(...args) {
    if (this.logLevel > 1)
      console.log(
        color.bright + color.yellow,
        util.format.apply(null, args),
        color.normal
      )
  }
  e(...args) {
    if (this.logLevel > 0)
      console.log(color.red, util.format.apply(null, args), color.normal)
  }
}

module.exports = new Log()
