const path = require('path')
const datakilde = require('./datakilde')
const kodesystem = require('./kodesystem')
const cachePath = './cache'

const config = {
  logLevel: 5,
  kodesystem: kodesystem,
  lasteScriptPath: './steg/',
  datakilde: datakilde,
  infoUrl: {
    nin: 'https://www.artsdatabanken.no/NiN2.0/'
  },
  getCachePath: function(relPath) {
    return cachePath + '/' + relPath + '/'
  },
  dataRoot: './data',
  getDataPath: function(relPath, extension = '.json') {
    let i = relPath.lastIndexOf('/')
    i = relPath.lastIndexOf('/', i - 1)
    const stegOgNavn = relPath.substring(i).replace(/.js$/, extension)
    return this.dataRoot + '/' + stegOgNavn.replace('.test', '')
  }
}

module.exports = config
