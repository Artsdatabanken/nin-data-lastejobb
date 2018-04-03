const path = require('path')

const cachePath = '../cache'
const dataPath = '../data'

const config = {
  rotkode: '~',
  getCachePath: function(relPath) {
    return cachePath + '/' + relPath + '/'
  },
  getDataPath: function(relPath) {
    return dataPath + '/' + path.basename(relPath)
  }
}

module.exports = config
