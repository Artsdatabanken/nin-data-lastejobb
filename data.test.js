var io = require('./lib/io')
const config = require('./config')
var { tellBarnasNøkler } = require('./lib/testHelper')

const files = io.findFiles(config.dataRoot, '.json')
files.forEach(file => {
  const json = io.readJson(file)
  describe(file, () => {
    it('har forventede nøkler', () => {
      const actual = tellBarnasNøkler(json)
      expect(actual).toMatchSnapshot()
    })
    it('har antall rader', () => {
      const actual = Object.keys(json).length
      expect(actual).toMatchSnapshot()
    })
  })
})
