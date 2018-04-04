const path = require('path')

const cachePath = '../cache'
const dataPath = '../data'

const config = {
  logLevel: 5,
  rotkode: '~',
  lasteScriptPath: './steg/',
  getCachePath: function(relPath) {
    return cachePath + '/' + relPath + '/'
  },
  getDataPath: function(relPath) {
    return (
      dataPath + '/' + path.parse(relPath.replace('.test', '')).name + '.json'
    )
  }
}

module.exports = config
