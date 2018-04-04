const path = require('path')
const datakilde = require('./datakilde')
const kodesystem = require('./kodesystem')
const cachePath = './cache'
const dataPath = './data'

const config = {
  logLevel: 5,
  kodesystem: kodesystem,
  lasteScriptPath: './steg/',
  datakilde: datakilde,
  getCachePath: function(relPath) {
    return cachePath + '/' + relPath + '/'
  },
  getDataPath: function(relPath, extension = '.json') {
    let i = relPath.lastIndexOf('/')
    i = relPath.lastIndexOf('/', i - 1)
    const stegOgNavn = relPath.substring(i).replace(/.js$/, extension)
    return dataPath + '/' + stegOgNavn.replace('.test', '')
  }
}

module.exports = config
