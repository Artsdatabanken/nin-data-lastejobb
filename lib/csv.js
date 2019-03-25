const parse = require("csv-parse/lib/sync")
const fs = require("fs")
var JSONStream = require("JSONStream")

function les(csvFilePath) {
  const input = fs.readFileSync(csvFilePath)
  const records = parse(input, {
    columns: true
  })
  return records
}

module.exports = { les }
