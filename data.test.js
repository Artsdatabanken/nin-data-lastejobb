const { io, log } = require("lastejobb")
const config = require("./config")
var { tellBarnasNøkler } = require("./lib/testHelper")

const dataFiles = io.findFiles(config.dataRoot, ".json")
const buildFiles = io.findFiles(config.buildRoot, ".json")
const files = dataFiles.concat(buildFiles)

files.forEach(file => {
  log.warn(file)
  const json = io.readJson(file)
  describe(file, () => {
    it("har forventede nøkler", () => {
      const actual = tellBarnasNøkler(json)
      expect(actual).toMatchSnapshot()
    })
    it("har antall rader", () => {
      const actual = Object.keys(json).length
      expect(actual).toMatchSnapshot()
    })
  })
})
