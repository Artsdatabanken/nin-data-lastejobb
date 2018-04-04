describe('', function() {
  var io = require('../../lib/io')
  var log = require('../../lib/log')
  var config = require('../../config')
  var json = io.readJson(config.getDataPath(__filename))
  var { tellBarnasNøkler } = require('../../lib/testHelper')

  it('har antall rader', () => {
    const actual = Object.keys(json).length
    expect(actual).toMatchSnapshot()
  })

  it('har nøkler', () => {
    const actual = tellBarnasNøkler(json)
    expect(actual).toMatchSnapshot()
  })
})
